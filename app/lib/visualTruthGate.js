export function acceptVisualVerdict(verdict){
 if(typeof verdict?.containsReadableText!=="boolean"||typeof verdict?.hasInfographicLayout!=="boolean")
  return {...verdict,pass:false,reason:"typography-unverified"};
 if(verdict.containsReadableText)
  return {...verdict,pass:false,reason:"visible-typography"};
 if(verdict.hasInfographicLayout)
  return {...verdict,pass:false,reason:"infographic-layout"};
 return verdict;
}
