import { Link } from 'react-router-dom'

const POSTS = [
  { title: 'The Lost Grains: Why Millets Are Making a Comeback', excerpt: 'Once a staple in every Indian home, millets are regaining their place as a superfood.', date: 'Mar 15, 2026', author: 'HaiFarmer Team', tag: 'Nutrition' },
  { title: 'Meet the Forest Honey Harvesters of Araku', excerpt: 'A deep dive into the traditional honey hunting practices of the Araku Valley tribes.', date: 'Feb 28, 2026', author: 'HaiFarmer Team', tag: 'Stories' },
  { title: 'Chemical-Free Farming: A Return to Our Roots', excerpt: 'How tribal farming methods hold the key to sustainable agriculture.', date: 'Feb 10, 2026', author: 'HaiFarmer Team', tag: 'Sustainability' },
  { title: 'The Health Benefits of Cold-Pressed Oils', excerpt: 'Why wood-pressed oils are superior to refined oils and how they retain their nutritional value.', date: 'Jan 25, 2026', author: 'HaiFarmer Team', tag: 'Wellness' },
  { title: 'From Our Farmers to Your Plate: The Journey', excerpt: 'Trace the path of a product from tribal farm to your doorstep.', date: 'Jan 12, 2026', author: 'HaiFarmer Team', tag: 'Behind the Scenes' },
  { title: '5 Easy Ways to Add Millets to Your Daily Diet', excerpt: 'Simple and delicious recipes to incorporate these nutritious grains into your meals.', date: 'Dec 20, 2025', author: 'HaiFarmer Team', tag: 'Recipes' },
]

export default function Journal() {
  return (
    <div className="bg-white">
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[35vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Journal</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">Our Journal</h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">Stories, recipes, and insights from the world of natural farming.</p>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map(post => (
              <article key={post.title} className="bg-white rounded-xl border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="aspect-[16/9] bg-green-50 flex items-center justify-center text-3xl">
                  {post.tag === 'Nutrition' && '🌾'}
                  {post.tag === 'Stories' && '📖'}
                  {post.tag === 'Sustainability' && '🌱'}
                  {post.tag === 'Wellness' && '🧘'}
                  {post.tag === 'Behind the Scenes' && '🔍'}
                  {post.tag === 'Recipes' && '🍳'}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-green-600 mb-2">
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5">{post.tag}</span>
                    <span className="text-muted">{post.date}</span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-ink leading-snug">{post.title}</h2>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{post.excerpt}</p>
                  <p className="mt-3 text-[11px] text-muted">By {post.author}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-18 bg-sand">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Stay Connected</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Follow us for the latest updates, recipes, and stories from tribal farmers.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Explore Products →</Link>
        </div>
      </section>
    </div>
  )
}
