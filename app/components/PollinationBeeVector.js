"use client";
import {forwardRef} from "react";

/** Entirely authored vector actor. Parent supplies an SVG g transform. */
const Bee = forwardRef(function PollinationBeeVector({pollenRef,alive=true},ref){
 return <g ref={ref} className="bee-v2-moving" aria-label="نحلة متجهة نحو الزهرة">
  <g className={alive?"bee-v2-live":""}>
   <g className="bee-v2-wing wing-upper">
    <path d="M-13 -10 C-58 -81 -10 -92 13 -27 Q17 -19 -13 -10Z" fill="url(#wingGlaze)" stroke="#eafaff" strokeOpacity=".63" strokeWidth="1.8"/>
    <path d="M-11 -14 Q-15 -62 3 -64" fill="none" stroke="#f5ffff" opacity=".6"/>
   </g>
   <g className="bee-v2-wing wing-lower">
    <path d="M8 -9 C16 -72 81 -54 44 -10 Q35 1 8 -9Z" fill="url(#wingGlaze)" stroke="#f3ffff" strokeOpacity=".58" strokeWidth="1.5"/>
    <path d="M14 -14 Q43 -42 53 -35" fill="none" stroke="#f7ffff" opacity=".5"/>
   </g>
   <path d="M46 -2 L70 -6 L48 6Z" fill="#1e1414"/>
   <ellipse cx="15" cy="1" rx="53" ry="33" fill="url(#beeVelvet)" stroke="#f3b961" strokeWidth="1.5"/>
   <path d="M8 -31 Q32 -28 40 -19 L40 21 Q29 29 9 30Z" fill="#30211b" opacity=".9"/>
   <path d="M-3 -32 Q4 -34 12 -29 L12 29 Q1 34 -5 30Z" fill="#39271e" opacity=".92"/>
   <path d="M40 -14 Q47 1 39 18" fill="none" stroke="#ffda69" strokeWidth="4" opacity=".45"/>
   {Array.from({length:12},(_,i)=><path key={i} d={"M"+(-10+i*4)+" "+(-30+(i%3)*2)+" l"+(-6+i%4)+" -5"} fill="none" stroke="#f3d18c" strokeWidth="1.35" opacity=".7"/>)}
   <ellipse cx="-36" cy="-3" rx="26" ry="25" fill="url(#beeHead)" stroke="#7b5335" strokeWidth="2"/>
   <ellipse cx="-49" cy="-11" rx="7" ry="8" fill="#15191a"/>
   <ellipse cx="-51" cy="-13" rx="2.1" ry="2.2" fill="#ffffff" opacity=".83"/>
   <path d="M-47 -21 Q-58 -41 -73 -42 M-34 -24 Q-38 -43 -26 -48" stroke="#2c201c" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
   <path d="M-19 21 Q-24 38 -33 43 M-1 30 Q2 46 -5 48 M22 26 Q33 40 26 48" stroke="#493121" strokeWidth="3" fill="none" strokeLinecap="round"/>
   <g ref={pollenRef} opacity="0" className="bee-pollen-cargo">
    <circle cx="-31" cy="44" r="8" fill="#f5cf57"/><circle cx="-38" cy="39" r="4" fill="#ffe895"/>
    <circle cx="-26" cy="38" r="4" fill="#ffee9d"/><circle cx="-2" cy="49" r="5" fill="#f2c653"/>
   </g>
  </g>
 </g>;
});
export default Bee;
