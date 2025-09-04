export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-semantic-background via-primary-950 to-semantic-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent mb-4">
            MealStream
          </h1>
          <p className="text-xl text-neutral-300 mb-8">
            Find something perfect for your meal in under 30 seconds
          </p>
          <div className="glass-primary rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-neutral-200">
              Project setup complete! Ready to build the fastest streaming
              decision helper.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
