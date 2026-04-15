import { useEffect, useState } from "react";
import BlogCard from "../cards/BlogCard";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewBlogs = ({ blogs }: any) => {
  const navigate = useNavigate();

  const articlesPerPage = 9;
  const [searchParams] = useSearchParams();
  const value = searchParams.get("page");

  const [page, setPage] = useState(0);

  const startFrom = page;
  const endTo = articlesPerPage + startFrom;

  useEffect(() => {
    if (!value) {
      setPage(0);
      return;
    }

    if (Number(value) <= 0) {
      return;
    }
    setPage((Number(value) - 1) * articlesPerPage);
  }, [value]);

  return (
    <section className="w-10/12 min-2xl:w-8/12 mx-auto container mt-7">
      <h4 className="font-bold text-stone-800 text-xl">Derniers articles</h4>
      <p className="text-stone-600 text-sm">
        Restez à jour avec nos dernières publications sur la conception et le
        ferraillage.
      </p>
      <div className="grid grid-cols-3 gap-5 mt-5">
        {blogs.slice(startFrom, endTo).length ? (
          blogs
            .slice(startFrom, endTo)
            .map((article: any, index: any) => (
              <BlogCard key={index} data={article} />
            ))
        ) : (
          <div className="col-span-3">
            <p className="text-center font-bold text-stone-700">
              Aucun article disponible
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-5 mt-8">
        <div
          className={`transition-all duration-200 ${
            Number(value) === 1 || !value ? "text-stone-600 hover:text-stone-800" : "bg-stone-800 text-white hover:bg-stone-900"
          } p-2 rounded-full  cursor-pointer`}
          onClick={() => {
            if (Number(value) === 1 || !value) return;
            navigate(`/blog?page=${Number(value) - 1}`);
          }}
        >
          <ChevronLeft size={15} />
        </div>
        <div className="flex items-center gap-4">
          {blogs.length / articlesPerPage > 9 ? (
            <>
              <Link to="/blog?page=1">1</Link>
              <Link to="/blog?page=2">2</Link>
              <Link to="/blog?page=3">3</Link>
              <Link to="/blog?page=4">4</Link>
              <Link to={`/blog?page=${blogs.length / articlesPerPage}`}>
                {blogs.length / articlesPerPage}
              </Link>
            </>
          ) : (
            Array.from(
              { length: Math.ceil(blogs.length / articlesPerPage) },
              (_, index) => (
                <Link
                  className={`${
                    value
                      ? Number(value) === index + 1
                        ? "text-primary underline"
                        : ""
                      : index === 0
                      ? "text-primary underline"
                      : ""
                  } font-semibold`}
                  to={`/blog?page=${index + 1}`}
                  key={index}
                >
                  {index + 1}
                </Link>
              )
            )
          )}
        </div>
        <div
          className={`transition-all duration-200 ${
            Number(value) === Math.ceil(blogs.length / articlesPerPage) ? "text-stone-600 hover:text-stone-800" : "bg-stone-800 text-white hover:bg-stone-900"
          } p-2 rounded-full cursor-pointer`}
          onClick={() => {
            if (Number(value) === Math.ceil(blogs.length / articlesPerPage)) return;
            navigate(`/blog?page=${Number(value || 1) + 1}`);
          }}
        >
          <ChevronRight size={15} />
        </div>
      </div>
    </section>
  );
};

export default NewBlogs;
