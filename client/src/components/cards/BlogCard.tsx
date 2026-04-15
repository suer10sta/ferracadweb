import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogCardProps {
  data: {
    id: number;
    slug: string;
    tags: string[];
    title: string;
    description_seo: string;
    time_read: string;
    views: number;
    mainImg: string;
  };
  colorMain?: string
}

const darkColors: string[] = [
  "#006400", // green-dark (DarkGreen)
  "#013220", // very dark green
  "#1B1F22", // near-black gray
  "#0D1B2A", // dark navy blue
  "#2F4F4F", // dark slate gray
  "#3B3B3B", // dark gray
  "#4B0082", // indigo
  "#2C2C54", // dark purple-blue
  "#191970", // midnight blue
  "#3E2723", // dark brown
  "#2E7D32", // dark green (material style)
  "#1C1C1C", // pure dark gray
  "#223322", // earthy dark green
  "#222831", // dark charcoal
  "#37474F", // blue gray (dark)
];

const getRandomDarkColor = () => {
  const randomIndex = Math.floor(Math.random() * darkColors.length);
  return darkColors[randomIndex];
};

const BlogCard = ({ data, colorMain = "black" }: BlogCardProps) => {
  return (
    <Link to={`/blog/${data.slug}`} className="transition-all duration-200 rounded-2xl">
      <div className="relative">
        <img
          src={data.mainImg}
          alt={data.title}
          className="object-cover w-full rounded-2xl h-[242.6px] select-none"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {data.tags.map((tag, index) => {
            const color = getRandomDarkColor();
            return (
              <span
                key={index}
                style={{ backgroundColor: color }}
                className={`p-1 px-3 font-bold rounded-full text-white text-[9px] select-none`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <div className="p-2 px-4 flex flex-col gap-2">
        <h4 className={`font-bold text-[14px] ${colorMain === "black"? "text-stone-800":"text-white"} `}>{data.title}</h4>
        <p className={`text-xs ${colorMain === "black"? "text-stone-600":"text-white"}`}>{data.description_seo}</p>
        <div className="flex items-center gap-2">
            <Clock color={colorMain === "black" ? "#1C1C1C":"#fff"} size={15} />
            <p className={`font-medium text-[12px] ${colorMain === "black"? "text-stone-600":"text-white"}`}>{data.time_read}</p>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
