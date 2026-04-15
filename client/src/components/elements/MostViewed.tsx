import BlogCard from '../cards/BlogCard'

const MostViewed = ({ mostViewed }: any) => {
  return (
    <section className='w-10/12 min-2xl:w-8/12 mx-auto container bg-primary p-6 px-12 mt-7 rounded-xl shadow'>
        <h4 className='font-bold text-white text-xl'>Articles les plus lus</h4>
        <p className='text-white text-sm'>Découvrez les sujets qui intéressent le plus notre communauté d’experts.</p>
        <div className="grid grid-cols-3 gap-5 mt-5">
            {mostViewed.slice(0, 3).map((article: any, index: any) => (
              <BlogCard key={index} data={article} colorMain="#fff" />
            ))}
          </div>
    </section>
  )
}

export default MostViewed