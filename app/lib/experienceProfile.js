export function getExperienceProfile(audience="عام"){
 const t=String(audience||"عام").toLowerCase();
 const isChild=/طفل|أطفال|صغير|kids?|child/.test(t);
 const isStudent=/طالب|طالبة|طلاب|student|learner/.test(t);
 const isEducator=/معلم|معلّم|مدرس|مدرّس|أستاذ|teacher|educator/.test(t);
 const isSenior=/كبير\s*(بالعمر|بالعمر|بالسن|في السن)|كبار\s*السن|مسن|مسنّة|مسنة|older adult|senior|elder/.test(t);
 const isExpert=/خبير|متخصص|مختص|طبيب|دكتور|مهندس|باحث|expert|specialist|doctor|engineer|researcher/.test(t);

 if(isChild) return {
  id:"child",density:"simple",paceSec:3.6,terminology:"simple",interactionStyle:"guided",
  maxNodes:5,abstractionStart:18,toolDepth:"minimal",motionLevel:"clear",auto3d:"manual",
  challengeStyle:"concrete",labelMode:"always",fontScale:1.04
 };
 if(isSenior) return {
  id:"senior",density:"simple",paceSec:3.3,terminology:"plain",interactionStyle:"guided",
  maxNodes:5,abstractionStart:24,toolDepth:"minimal",motionLevel:"calm",auto3d:"manual",
  challengeStyle:"direct",labelMode:"always",fontScale:1.12
 };
 if(isEducator) return {
  id:"educator",density:"deep",paceSec:2.5,terminology:"standard",interactionStyle:"exploratory",
  maxNodes:7,abstractionStart:56,toolDepth:"full",motionLevel:"clear",auto3d:"adaptive",
  challengeStyle:"teachback",labelMode:"contextual",fontScale:1
 };
 if(isExpert) return {
  id:"expert",density:"deep",paceSec:1.9,terminology:"precise",interactionStyle:"technical",
  maxNodes:8,abstractionStart:82,toolDepth:"full",motionLevel:"precise",auto3d:"adaptive",
  challengeStyle:"causal",labelMode:"compact",fontScale:.98
 };
 if(isStudent) return {
  id:"student",density:"balanced",paceSec:2.7,terminology:"standard",interactionStyle:"guided",
  maxNodes:6,abstractionStart:45,toolDepth:"progressive",motionLevel:"clear",auto3d:"adaptive",
  challengeStyle:"prediction",labelMode:"contextual",fontScale:1
 };
 return {
  id:"general",density:"balanced",paceSec:2.7,terminology:"standard",interactionStyle:"exploratory",
  maxNodes:7,abstractionStart:50,toolDepth:"progressive",motionLevel:"clear",auto3d:"adaptive",
  challengeStyle:"prediction",labelMode:"contextual",fontScale:1
 };
}

export function clientExperience(presentation={}){
 return {
  id:presentation.profileId||presentation.id||"general",
  guided:presentation.interactionStyle==="guided",
  technical:presentation.interactionStyle==="technical",
  toolDepth:presentation.toolDepth||"progressive",
  abstractionStart:Number(presentation.abstractionStart??50),
  auto3d:presentation.auto3d||"adaptive",
  motionLevel:presentation.motionLevel||"clear",
  challengeStyle:presentation.challengeStyle||"prediction",
  labelMode:presentation.labelMode||"contextual",
  fontScale:Number(presentation.fontScale||1)
 };
}
