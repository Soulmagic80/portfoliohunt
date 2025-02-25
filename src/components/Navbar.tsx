export default function Navbar() {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <a href="/" className="text-xl font-bold">Portfoliohunt</a>
          <div>
            <a href="/portfolios" className="mr-4">Portfolios</a>
            <a href="/upload">Upload</a>
          </div>
        </div>
      </nav>
    );
  }