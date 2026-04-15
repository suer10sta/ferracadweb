import BlogCard from "../cards/BlogCard";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import blogData from "@/data/blog.json"

const BlogSection = () => {
  return (
    <section className="bg-before-red pt-14">
      <div className="w-10/12 min-2xl:w-8/12 mx-auto container">
        <div className="flex justify-center items-center">
          <span className="bg-white px-4 rounded-lg text-stone-800 font-bold text-[11px]">
            Blog
          </span>
        </div>
        <h3 className="font-bold text-3xl text-stone-100 text-center w-5/12 mx-auto">
          Actualités, conseils et bonnes pratiques
        </h3>
        <p className="text-white w-7/12 m-auto text-center text-sm mt-3">
          Restez informé des nouveautés Ferracad, découvrez des tutoriels, des
          études de cas et des astuces pour améliorer vos plans de ferraillage
          au quotidien.
        </p>
        <div className="bg-white p-8 rounded-lg shadow-2xl my-5 mb-24">
          <div className="grid grid-cols-3 gap-5">
            {blogData.slice(0, 6).map((article, index) => (
              <BlogCard key={index} data={article} />
            ))}
          </div>
          <Link to="/blog" className="flex items-center justify-center gap-2 text-stone-600 mt-4 transition-all duration-200 hover:text-stone-900">
            <p className="font-semibold text-xs">Voir Plus</p>
            <ChevronRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
