import React from "react";
import logoImage from "@assets/trustkeyper_logo.png"; // Assuming there is a logo or we can use text

export default function Footer() {
  return (
    <footer className="bg-[#111A2C] text-[#8C9EBA] py-16 px-6 md:px-20 lg:px-32 w-full mt-auto relative overflow-hidden">
      {/* Decorative background swoosh - using simple CSS shapes for approximation */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute w-[150%] h-[150%] bg-[#1A2B4C] rounded-[100%] -top-[100%] -left-[25%] -rotate-[15deg]"></div>
        <div className="absolute w-[150%] h-[150%] bg-[#15233A] rounded-[100%] top-[20%] -left-[10%] -rotate-[15deg]"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 relative z-10">
        
        {/* Logo Section */}
        <div className="lg:w-1/4">
          <div className="text-white font-semibold text-2xl flex flex-col leading-none tracking-tight">
            <span>TRUST</span>
            <span>KEYPER</span>
          </div>
        </div>

        {/* Links Section */}
        <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-3 text-sm">
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">FAQs</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>

          {/* Column 2 - Addresses */}
          <div className="flex flex-col gap-6 text-xs leading-relaxed">
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Noida</h4>
              <p>
                Office 8, 1st Floor, Block:
                <br />Mart, Mahagun Moderne,
                <br />Plot GH-02, Sector 78, Noida,
                <br />UP, India, 201301
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Bengaluru</h4>
              <p>
                HD-198, Embassy
                <br />TechVillage, Outer Ring Road
                <br />,Bellandur, Bengaluru,
                <br />Karnataka, India, 560103
              </p>
            </div>
          </div>

          {/* Column 3 - Contact */}
          <div className="flex flex-col gap-6 text-xs leading-relaxed">
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Contact :</h4>
              <div className="flex flex-col gap-2">
                <a href="tel:+918088516875" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  +91 8088516875
                </a>
                <a href="mailto:info@trustkeyper.com" className="flex items-center gap-2 hover:text-white transition-colors underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  info@trustkeyper.com
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Head office :</h4>
              <p>
                HD-198, Embassy
                <br />TechVillage, Outer Ring Road
                <br />,Bellandur, Bengaluru,
                <br />Karnataka, India, 560103
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
