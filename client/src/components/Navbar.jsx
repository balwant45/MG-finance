/* eslint-disable no-unused-vars */

export default function Navbar() {


  return (
    <div id="navbar" >
      <div className="flex-col md:flex-2">
        <span className="text-[2rem] font-light text-[#be322e]">Welcome, Balwant</span>
      </div>
      <div className="flex-none gap-2">
        <input
        style={{
         Color:"white",
          borderRadius:"25px",
          backgroundColor:"green"
        }}
          type="text"
          placeholder="Search..."
          className="input input-bordered"
        />
      </div>
    </div>
  );
}
