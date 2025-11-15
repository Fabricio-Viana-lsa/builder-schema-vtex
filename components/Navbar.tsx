import Link from "next/link"

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full p-4">
      <div className="flex flex-row w-full justify-between">
        <p className="font-bold">Builder Schema Vtex</p>
        <p>
          One Creation:{' '}
          <Link href={'https://github.com/Fabricio-P-Viana'} className="">
            Fabricio Viana
          </Link>
        </p>
      </div>
    </nav>
  )
}

export default Navbar
