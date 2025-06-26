import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { Card, CardContent } from "../components/AnalyticsComponents/cards";
import LightweightChart from "../components/AnalyticsComponents/LightweightChart";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/authContext";
import { pageview } from "../utils/gtag";
import DashboardLayout from "../components/dashboard/dashboardLayout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SingleBlogAnalytics = () => {
  const { blogId: paramBlogId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(paramBlogId || "");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pageview(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!paramBlogId) {
      axios
        .get(`${API_BASE_URL}/api/blog/admin`, { withCredentials: true })
        .then(({ data }) => setBlogs(data.blogs || []))
        .catch((err) => console.error("❌ Failed to fetch blogs:", err));
    }
  }, [paramBlogId]);

  useEffect(() => {
    if (!selectedBlog) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/analytics/blog/${selectedBlog}`, {
        withCredentials: true,
      })
      .then(({ data }) => setAnalytics(data))
      .catch((err) => {
        console.error("❌ Failed to fetch analytics:", err);
        setAnalytics(null);
      })
      .finally(() => setLoading(false));
  }, [selectedBlog]);

  const filterByDateRange = (data) => {
    if (!Array.isArray(data)) return [];
    const today = new Date();

    return data.filter(({ _id }) => {
      const date = new Date(_id);
      const diffDays = (today - date) / (1000 * 60 * 60 * 24);

      if (dateRange === "today") return diffDays < 1;
      if (dateRange === "week") return diffDays <= 7;
      if (dateRange === "month") return diffDays <= 30;
      if (dateRange === "6month") return diffDays <= 180;
      return true;
    });
  };

  const filteredViews = useMemo(() => {
    return filterByDateRange(analytics?.viewsByDate || []);
  }, [analytics, dateRange]);

  const totalViews = useMemo(() => {
    return analytics?.viewsByDate?.reduce((sum, item) => sum + item.count, 0) || 0;
  }, [analytics]);

  const metricCards = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: "Views", value: totalViews },
      { label: "Likes", value: analytics.totalLikes ?? 0 },
      { label: "Comments", value: analytics.totalComments ?? 0 },
      { label: "Saved", value: analytics.totalSaved ?? 0 },
    ];
  }, [analytics, totalViews]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg text-red-600 font-semibold">
          🚫 Access denied. Only admins can view analytics.
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 bg-[#F1F5F9] min-h-screen">
        <h1 className="text-3xl font-bold text-[#1E293B] animate-fade-in">
          📊 Blog Analytics
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {!paramBlogId && (
            <select
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              className="p-2 rounded-md border text-sm bg-white shadow-sm text-[#1E293B]"
            >
              <option value="">📄 Select Blog</option>
              {blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </select>
          )}

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 rounded-md border text-sm bg-white shadow-sm text-[#1E293B]"
          >
            <option value="today">📅 Today</option>
            <option value="week">🗓 This Week</option>
            <option value="month">📆 This Month</option>
            <option value="6month">📈 Last 6 Months</option>
          </select>
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-[#E7000B]" />
          </div>
        ) : !analytics ? (
          <div className="text-center text-red-600 mt-10 text-lg font-medium">
            ⚠️ Unable to load analytics data. Please try again later.
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-container">
              {metricCards.map((metric, idx) => (
                <div key={idx} className="animate-stagger-item">
                  <Card className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-shadow">
                    <CardContent>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <h2 className="text-2xl font-bold text-[#E7000B]">
                        {metric.value}
                      </h2>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Blog Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md mt-8 animate-fade-in">
              <h3 className="text-xl font-semibold text-[#1E293B]">Blog Details</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600"><strong>Title:</strong> {analytics?.blog?.title}</p>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-8 animate-fade-in">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">
                📈 Daily Views Trend
              </h3>

              {filteredViews.length > 0 ? (
                <LightweightChart
                  data={filteredViews.map(item => ({
                    label: new Date(item._id).toLocaleDateString(),
                    value: item.count
                  }))}
                  type="line"
                  title=""
                  color="#E7000B"
                  height={300}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No view data available for the selected time range.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleBlogAnalytics;
