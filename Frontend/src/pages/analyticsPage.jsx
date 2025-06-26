import { useEffect, useState, useMemo } from "react";
import SummaryCard from "../components/AnalyticsComponents/summeryCard";
import HighlightCard from "../components/AnalyticsComponents/HighlightCard";
import ViewsChart from "../components/AnalyticsComponents/viewChart";
import BlogsBarChart from "../components/AnalyticsComponents/blogsBarChart";
import FilterComponent from "../components/AnalyticsComponents/filterComponent";
import LightweightChart from "../components/AnalyticsComponents/LightweightChart";
import { useAuth } from "../context/authContext";
import { pageview, event } from "../utils/gtag";
import DashboardLayout from "../components/dashboard/dashboardLayout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB"];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("📊 Analytics API Data:", result);
      setData(result);
    } catch (err) {
      console.error("❌ Analytics fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pageview("/admin/analytics");
    fetchAnalytics();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredBlogs = useMemo(() => {
    if (!data?.blogs) return [];
    if (!filter.trim()) return data.blogs;
    return data.blogs.filter((blog) =>
      blog?.title?.toLowerCase().includes(filter.toLowerCase()) ||
      blog?.category?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const mostViewedBlog = data?.mostViewedBlog || null;
  const mostLikedBlog = data?.mostLikedBlog || null;

  const handleBlogClick = (slug) => {
    event({
      category: "Blog Analytics",
      action: "Click Blog Link",
      label: slug,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600"></div>
        <p className="mt-4 text-gray-500 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F1F5F9]">
        <p className="text-xl text-red-600 font-semibold">🚫 Access Denied: Admins only.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F1F5F9] px-6 py-8">
        <h1 className="text-3xl font-bold text-[#1E293B] mb-8">📈 Blog Analytics</h1>

        {/* Filter Section */}
        <FilterComponent filter={filter} onFilterChange={handleFilterChange} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <SummaryCard label="Total Blogs" value={data?.totalBlogs || 0} color="border-blue-500" />
          <SummaryCard label="Total Views" value={data?.totalViews || 0} color="border-green-500" />
          <SummaryCard label="Total Likes" value={data?.totalLikes || 0} color="border-purple-500" />
          <SummaryCard label="Total Comments" value={data?.totalComments || 0} color="border-pink-500" />
          <SummaryCard label="Total Users" value={data?.totalUsers || 0} color="border-orange-500" />
          <SummaryCard label="Active Users" value={data?.activeUsers || 0} color="border-yellow-500" />
          <SummaryCard label="Published Blogs" value={data?.publishedCount || 0} color="border-cyan-500" />
          <SummaryCard label="Draft Blogs" value={data?.draftCount || 0} color="border-gray-500" />
        </div>

        {/* Growth Metrics */}
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">📊 Growth Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <BlogsBarChart data={data?.blogsPerMonth || []} />
          <ViewsChart data={data?.viewsLast7Days || []} />
        </div>

        {/* Referrers and Search Queries */}
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">🌐 Referrers & Search Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <LightweightChart
            data={data?.topReferrers?.map(item => ({
              label: item.referrer,
              value: item.count
            })) || []}
            type="bar"
            title="Top Referrers"
            color="#60A5FA"
            height={250}
          />
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-4 text-[#0F172A]">Top Search Queries</h3>
            <div className="space-y-3">
              {data?.topSearchQueries?.slice(0, 8).map((query, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 truncate">{query.query}</span>
                  <span className="text-sm font-semibold text-blue-600">{query.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">🏆 Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {mostViewedBlog ? (
            <HighlightCard
              label="🔥 Most Viewed Blog"
              title={mostViewedBlog?.title}
              subtext={`Author: ${mostViewedBlog?.author?.name || "Unknown"}`}
              image={mostViewedBlog?.coverImage}
              link={`/blog/${mostViewedBlog?.slug}`}
              onClick={() => handleBlogClick(mostViewedBlog?.slug)}
            />
          ) : (
            <p className="text-gray-500">No viewed blogs available.</p>
          )}
          {mostLikedBlog ? (
            <HighlightCard
              label="❤️ Most Liked Blog"
              title={mostLikedBlog?.title}
              subtext={`Likes: ${mostLikedBlog?.likesCount || 0}`}
              link={`/blog/${mostLikedBlog?.slug}`}
              onClick={() => handleBlogClick(mostLikedBlog?.slug)}
            />
          ) : (
            <p className="text-gray-500">No liked blogs available.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;