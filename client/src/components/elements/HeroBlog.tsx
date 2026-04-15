import React, { useState } from "react";

const HeroBlog = ({ mostLiked }: any) => {
  const [activeBlog, setActiveBlog] = useState(1);
  return (
    <section>
      <div className="flex items-center gap-5">
        {mostLiked.map((blog: any, index: any) => (
          <div
            key={index}
            onClick={()=> setActiveBlog(index)}
            className={`transition-all duration-200 ${activeBlog === index ? "w-[60%]" : "w-[20%] cursor-pointer"} relative ${
              activeBlog === index ? "bg-color-linear" : ""
            } ${
              index === 1
                ? "rounded-2xl"
                : index === 0
                ? "rounded-r-2xl"
                : "rounded-l-2xl"
            } relative overflow-hidden`}
          >
            <img
              src={blog.mainImg}
              alt={blog.title}
              className={`${
                activeBlog === index
                  ? ""
                  : "brightness-50 transition-all duration-200 hover:brightness-75"
              } ${
                index === 1
                  ? "rounded-2xl"
                  : index === 0
                  ? "rounded-r-2xl"
                  : "rounded-l-2xl"
              } h-[518px] object-cover w-full`}
            />
            {activeBlog === index ? (
              <div className="absolute top-0 left-0 w-full h-full flex justify-start items-end">
                <div className="p-5 px-10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {blog.tags.map(
                      (tag: any, index: React.Key | null | undefined) => (
                        <span
                          key={index}
                          className={`p-1 bg-white px-3 font-bold rounded-full text-stone-800 text-[9px] select-none`}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                  <h3 className="font-medium text-4xl text-stone-100">
                    {blog.title}
                  </h3>
                  <p className="text- text-stone-200">{blog.description_seo}</p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroBlog;
