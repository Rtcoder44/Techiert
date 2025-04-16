import React from "react";
import DashboardLayout from "../../components/dashboard/dashboardLayout";
import { motion } from "framer-motion";
import { FaBullseye, FaHandshake, FaRocket, FaGithub, FaLinkedin } from "react-icons/fa";

const About = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
        {/* Header */}
        <motion.h1
          className="text-4xl font-bold text-center text-[#1E293B] mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Techiert
        </motion.h1>

        <motion.p
          className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          At Techiert, we’re passionate about technology, sharing knowledge, and helping users stay updated with the latest in tech. Our platform is designed for tech enthusiasts, learners, and professionals alike.
        </motion.p>

        {/* Mission, Vision, Promise */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Our Mission",
              icon: <FaRocket className="text-blue-600 text-3xl mb-3" />,
              text: "To empower and inform through clean, accurate, and practical tech content.",
            },
            {
              title: "Our Vision",
              icon: <FaBullseye className="text-green-600 text-3xl mb-3" />,
              text: "To become a trusted hub for technology lovers across the globe.",
            },
            {
              title: "Our Promise",
              icon: <FaHandshake className="text-purple-600 text-3xl mb-3" />,
              text: "Community-first, user-centric, and always evolving with tech.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-md rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {item.icon}
              <h3 className="text-xl font-semibold text-[#1E293B] mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* About Me Section */}
        <motion.div
          className="mt-20 bg-white shadow-xl rounded-3xl p-8 max-w-4xl mx-auto text-center border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src="https://res.cloudinary.com/dj6zyomvw/image/upload/t_Profile/v1744828679/IMG_20220209_230501_795_o3o3hp.png"
            alt="Ritik Gupta"
            className="mx-auto w-32 h-32 rounded-full border-4 border-blue-500 mb-4 object-cover shadow-sm"
          />
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Ritik Gupta</h2>
          <p className="text-gray-600 text-sm mb-4">Founder • Full Stack Developer • Tech Blogger</p>

          <motion.p
            className="text-gray-700 mb-6 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hey! I’m Ritik — a passionate full stack developer and the founder of <strong>Techiert.com</strong>. I love building meaningful digital products, especially ones that empower and educate.
            Techiert is my brainchild, built from the ground up using the <strong>MERN</strong> stack and a deep desire to share knowledge with a growing tech community.
          </motion.p>

          {/* Tech Stack */}
          <h3 className="font-semibold text-[#1E293B] text-lg mb-3">Tech Stack I Work With 💻</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            {[
              { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
              { name: "React.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
              { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
              { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
              { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
              { name: "WordPress", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg" },
            ].map((tech, index) => (
              <div key={index} className="tooltip relative group">
                <img
                  src={tech.icon}
                  alt={tech.name}
                  title={tech.name}
                  className="w-10 h-10 transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute bottom-[-1.8rem] left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>

          {/* Freelancer Pitch */}
          <p className="mt-4 text-gray-600 leading-relaxed">
            Looking to build a modern, responsive, and scalable website? Whether it's a blog, portfolio, business site, or web app —
            I help clients bring their ideas to life with clean code and creative solutions. Let’s build something awesome together!
          </p>

          {/* Social & CTA */}
          <div className="flex justify-center gap-6 mt-6">
            <a
              href="https://github.com/Rtcoder44"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black text-2xl transition"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/ritik-gupta-1529191b1/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-2xl transition"
            >
              <FaLinkedin />
            </a>
          </div>

          <motion.a
            href="/contact"
            className="mt-8 inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition"
            whileHover={{ scale: 1.05 }}
          >
            Hire Me
          </motion.a>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default About;
