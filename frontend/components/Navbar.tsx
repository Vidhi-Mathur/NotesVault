import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-black flex items-center justify-center">
      <div className="absolute -top-28 left-0 p-2">
        <Image src="/logo.png" alt="logo" width={300} height={300} className="drop-shadow-lg"/>
      </div>
    </nav>
  );
};
