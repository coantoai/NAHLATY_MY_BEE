const packs=[
 {
  id:"plant-growth",
  domain:"biology",
  title:"كيف تنمو النباتات؟",
  keywords:["نبات","نمو النبات","تنمو النباتات","تمثيل ضوئي","بناء ضوئي","photosynthesis","plant growth","grow plant"],
  answer:"تستخدم النباتات الضوء والماء وثاني أكسيد الكربون لصنع السكريات عبر البناء الضوئي. هذه السكريات توفر مادة وطاقة لبناء خلايا وأنسجة جديدة، بينما تمتص الجذور الماء والعناصر المعدنية من التربة.",
  explanation:"لفهم النمو بصريًا، تتبع المواد والطاقة: ماء من الجذور، ثاني أكسيد الكربون من الهواء، وضوء عند الأوراق؛ ثم تتحول هذه المدخلات إلى سكريات تُستخدم في بناء أنسجة جديدة.",
  sources:[
   {title:"NASA — The Carbon Cycle",url:"https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/"},
   {title:"NASA — Photosynthesis",url:"https://www.grc.nasa.gov/www/k-12/Aero2000/studweb/glossary/photosyn.html"}
  ],
  truthAnchors:[
   "البناء الضوئي يستخدم الضوء والماء وثاني أكسيد الكربون لصنع السكريات ويطلق الأكسجين.",
   "السكر الناتج يخزن طاقة كيميائية ويمكن استخدامه لبناء مكونات جديدة في النبات.",
   "الماء يدخل إلى النبات أساسًا عبر الجذور."
  ],
  visualPlan:{target:"تتبع المواد والطاقة التي تتحول إلى نمو نباتي",operations:["FLOW","SEQUENCE","HIGHLIGHT"],focus:["roots","leaf","sugar","growth"],camera:"follow"},
  sceneGraph:{
   world:{theme:"nature",dimension:"2d",label:"من الموارد إلى النمو"},
   nodes:[
    {id:"roots",label:"الجذور",glyph:"⌄",visual:"plant",x:18,y:72,knowledge:"fact",detail:"تمتص الماء والعناصر المعدنية."},
    {id:"leaf",label:"الورقة",glyph:"☘",visual:"plant",x:43,y:38,knowledge:"fact",detail:"تستقبل الضوء وثاني أكسيد الكربون."},
    {id:"sugar",label:"سكريات",glyph:"◇",visual:"product",x:67,y:38,knowledge:"fact",detail:"طاقة كيميائية ومادة أولية للبناء."},
    {id:"growth",label:"أنسجة جديدة",glyph:"↑",visual:"plant",x:84,y:68,knowledge:"fact",detail:"تُبنى خلايا وأوراق وجذور جديدة."}
   ],
   edges:[
    {id:"e1",from:"roots",to:"leaf",label:"ماء",relation:"flow",causal:true,knowledge:"fact"},
    {id:"e2",from:"leaf",to:"sugar",label:"بناء ضوئي",relation:"transform",causal:true,knowledge:"fact"},
    {id:"e3",from:"sugar",to:"growth",label:"بناء",relation:"cause",causal:true,knowledge:"fact"}
   ]
  },
  steps:[
   {title:"الماء",text:"تمتص الجذور الماء من التربة.",focusNodeIds:["roots"],activeEdgeIds:["e1"],motion:"travel"},
   {title:"صنع الغذاء",text:"تستخدم الأوراق الضوء والماء وثاني أكسيد الكربون لصنع السكريات.",focusNodeIds:["leaf","sugar"],activeEdgeIds:["e2"],motion:"connect"},
   {title:"النمو",text:"تُستخدم السكريات كمصدر طاقة ومادة لبناء أنسجة جديدة.",focusNodeIds:["sugar","growth"],activeEdgeIds:["e3"],motion:"grow"}
  ]
 },
 {
  id:"solar-cell",
  domain:"technology",
  title:"كيف تعمل الخلية الشمسية؟",
  keywords:["خلية شمسية","خلايا شمسية","لوح شمسي","ألواح شمسية","طاقة شمسية","solar cell","photovoltaic","pv cell","solar panel"],
  answer:"تمتص مادة شبه موصلة في الخلية الشمسية طاقة الضوء. تمنح هذه الطاقة إلكترونات قدرة على الحركة، ويجعل تصميم الخلية الشحنات تتحرك نحو جهات محددة، فتتولد تيارات كهربائية تُجمع عبر نقاط التلامس المعدنية.",
  explanation:"المشهد الأفضل هو تدفق طاقة: فوتونات تصل إلى شبه الموصل، إلكترونات تصبح حرة للحركة، ثم تُوجَّه الشحنات إلى دائرة خارجية فيظهر التيار الكهربائي.",
  sources:[
   {title:"U.S. Department of Energy — Solar Photovoltaic Cell Basics",url:"https://www.energy.gov/cmei/systems/solar-photovoltaic-cell-basics"},
   {title:"U.S. Department of Energy — PV Cells 101",url:"https://www.energy.gov/cmei/systems/articles/pv-cells-101-primer-solar-photovoltaic-cell"}
  ],
  truthAnchors:[
   "الخلية الكهروضوئية تحتوي مادة شبه موصلة تمتص ضوء الشمس.",
   "طاقة الضوء تمنح إلكترونات طاقة تسمح لها بالحركة.",
   "يُجمع التيار الكهربائي عبر نقاط تلامس موصلة."
  ],
  visualPlan:{target:"تحويل طاقة الضوء إلى تيار كهربائي",operations:["FLOW","DIRECTION","SEQUENCE","HIGHLIGHT"],focus:["photon","semiconductor","electron","circuit"],camera:"follow"},
  sceneGraph:{
   world:{theme:"technology",dimension:"hybrid",label:"من الضوء إلى الكهرباء"},
   nodes:[
    {id:"photon",label:"ضوء الشمس",glyph:"☀",visual:"signal",x:15,y:25,knowledge:"fact",detail:"طاقة ضوئية تصل إلى الخلية."},
    {id:"semiconductor",label:"شبه الموصل",glyph:"▦",visual:"stack",x:40,y:48,knowledge:"fact",detail:"يمتص الضوء وينقل طاقته إلى الإلكترونات.",spatial:true},
    {id:"electron",label:"إلكترونات متحركة",glyph:"•",visual:"signal",x:66,y:42,knowledge:"fact",detail:"تكتسب طاقة تسمح لها بالحركة."},
    {id:"circuit",label:"تيار كهربائي",glyph:"↯",visual:"signal",x:85,y:67,knowledge:"fact",detail:"يُجمع عبر نقاط التلامس ويغذي دائرة خارجية."}
   ],
   edges:[
    {id:"e1",from:"photon",to:"semiconductor",label:"امتصاص",relation:"flow",causal:true,knowledge:"fact"},
    {id:"e2",from:"semiconductor",to:"electron",label:"نقل طاقة",relation:"cause",causal:true,knowledge:"fact"},
    {id:"e3",from:"electron",to:"circuit",label:"تدفق شحنة",relation:"flow",causal:true,knowledge:"fact"}
   ]
  },
  steps:[
   {title:"وصول الضوء",text:"تصل طاقة الضوء إلى المادة شبه الموصلة.",focusNodeIds:["photon","semiconductor"],activeEdgeIds:["e1"],motion:"travel"},
   {title:"تحريك الإلكترونات",text:"تمتص المادة الضوء فتكتسب الإلكترونات طاقة للحركة.",focusNodeIds:["semiconductor","electron"],activeEdgeIds:["e2"],motion:"connect"},
   {title:"التيار",text:"تُجمع حركة الشحنات عبر نقاط التلامس كتيار كهربائي.",focusNodeIds:["electron","circuit"],activeEdgeIds:["e3"],motion:"travel"}
  ]
 },
 {
  id:"bee-pollination",
  domain:"biology",
  title:"كيف يلقّح النحل الأزهار؟",
  keywords:["نحل","نحلة","تلقيح","يلقح","حبوب اللقاح","pollination","bee pollination","pollen"],
  answer:"عندما تزور النحلة زهرة بحثًا عن الرحيق أو حبوب اللقاح، تلتصق حبوب لقاح بجسمها. وعند زيارة زهرة أخرى يمكن أن تنتقل هذه الحبوب إلى الجزء الأنثوي من الزهرة، ما يتيح الإخصاب وتكوين البذور أو الثمار في النباتات التي تعتمد على هذا النوع من التلقيح.",
  explanation:"نحرّك المعنى عبر انتقال واحد واضح: حبوب لقاح من زهرة أولى → جسم النحلة → زهرة ثانية. الحركة الرئيسية هي انتقال الحبوب، بينما تبقى بقية الصورة هادئة.",
  sources:[
   {title:"US Forest Service — Forest Ecosystem Services: Pollination",url:"https://research.fs.usda.gov/pnw/nwch/ecosystem-services/forests"},
   {title:"US Forest Service — Native Pollinators",url:"https://www.fs.usda.gov/wildflowers/pollinators/documents/AgCanadaNativePollinators.pdf"}
  ],
  truthAnchors:[
   "الملقحات تحمل حبوب اللقاح بين الأجزاء التناسلية للأزهار.",
   "النحل من أهم الملقحات الحشرية.",
   "انتقال حبوب اللقاح يمكن أن يساعد النبات على إنتاج بذور أو ثمار."
  ],
  visualPlan:{target:"رؤية انتقال حبوب اللقاح بين زهرتين بواسطة النحلة",operations:["FOCUS","FLOW","DIRECTION","SEQUENCE"],focus:["flower-a","bee","pollen","flower-b"],camera:"tracking"},
  sceneGraph:{
   world:{theme:"nature",dimension:"2d",label:"رحلة حبة اللقاح"},
   nodes:[
    {id:"flower-a",label:"زهرة أولى",glyph:"✿",visual:"plant",x:17,y:55,knowledge:"fact",detail:"مصدر حبوب اللقاح."},
    {id:"pollen",label:"حبوب اللقاح",glyph:"••",visual:"signal",x:35,y:42,knowledge:"fact",detail:"تلتصق بجسم الملقح."},
    {id:"bee",label:"النحلة",glyph:"✦",visual:"generic",x:54,y:50,knowledge:"fact",detail:"تنقل الحبوب أثناء زياراتها للأزهار."},
    {id:"flower-b",label:"زهرة ثانية",glyph:"✿",visual:"plant",x:82,y:52,knowledge:"fact",detail:"تستقبل بعض حبوب اللقاح."}
   ],
   edges:[
    {id:"e1",from:"flower-a",to:"pollen",label:"تلتقط",relation:"flow",causal:false,knowledge:"fact"},
    {id:"e2",from:"pollen",to:"bee",label:"تلتصق",relation:"connect",causal:false,knowledge:"fact"},
    {id:"e3",from:"bee",to:"flower-b",label:"تنقل",relation:"flow",causal:true,knowledge:"fact"}
   ]
  },
  steps:[
   {title:"الزهرة الأولى",text:"تلتصق حبوب اللقاح بجسم النحلة أثناء الزيارة.",focusNodeIds:["flower-a","pollen","bee"],activeEdgeIds:["e1","e2"],motion:"connect"},
   {title:"الانتقال",text:"تتحرك النحلة إلى زهرة أخرى وهي تحمل بعض حبوب اللقاح.",focusNodeIds:["pollen","bee"],activeEdgeIds:["e2"],motion:"travel"},
   {title:"التلقيح",text:"تنتقل بعض الحبوب إلى الزهرة الثانية، ما يسمح ببدء عملية التكاثر في النبات.",focusNodeIds:["bee","flower-b"],activeEdgeIds:["e3"],motion:"travel"}
  ]
 },
 {
  id:"combustion-engine",
  domain:"mechanical",
  title:"كيف يعمل محرك الاحتراق الداخلي؟",
  keywords:["محرك احتراق","محرك السيارة","محرك بنزين","بستم","مكبس","احتراق داخلي","internal combustion","car engine","piston engine","gasoline engine"],
  answer:"في محرك البنزين رباعي الأشواط يدخل خليط الهواء والوقود إلى الأسطوانة، ثم يضغطه المكبس، وتشعله شمعة الإشعال. تمدد غازات الاحتراق يدفع المكبس، فيدير عمود المرفق، ثم تُطرد غازات العادم وتبدأ الدورة من جديد.",
  explanation:"أفضل شرح بصري هو دورة من أربع مراحل داخل أسطوانة واحدة: سحب → ضغط → احتراق/قدرة → عادم. الحركة الرئيسية هي صعود وهبوط المكبس مع تغيّر حالة الخليط.",
  sources:[
   {title:"U.S. Department of Energy — Internal Combustion Engine Basics",url:"https://www.energy.gov/cmei/vehicles/articles/internal-combustion-engine-basics"}
  ],
  truthAnchors:[
   "محرك البنزين رباعي الأشواط يمر بالسحب والضغط والاحتراق/القدرة والعادم.",
   "الاحتراق يتم داخل الأسطوانة وتمدده يدفع المكبس.",
   "حركة المكبس تُحوَّل إلى دوران في عمود المرفق."
  ],
  visualPlan:{target:"فهم كيف تتحول طاقة الاحتراق إلى حركة دورانية",operations:["CUTAWAY","SEQUENCE","DIRECTION","HIGHLIGHT"],focus:["cylinder","piston","spark","crankshaft"],camera:"inside"},
  sceneGraph:{
   world:{theme:"mechanical",dimension:"3d",label:"داخل الأسطوانة"},
   nodes:[
    {id:"intake",label:"هواء + وقود",glyph:"↓",visual:"stream",x:18,y:28,knowledge:"fact",detail:"يدخل الخليط في شوط السحب."},
    {id:"cylinder",label:"الأسطوانة",glyph:"▯",visual:"generic",x:43,y:44,knowledge:"fact",detail:"الحجرة التي يحدث فيها الضغط والاحتراق.",spatial:true},
    {id:"piston",label:"المكبس",glyph:"▰",visual:"gear",x:49,y:68,knowledge:"fact",detail:"يتحرك داخل الأسطوانة."},
    {id:"spark",label:"الإشعال",glyph:"✦",visual:"fire",x:58,y:26,knowledge:"fact",detail:"يشعل الخليط في محرك البنزين."},
    {id:"crankshaft",label:"عمود المرفق",glyph:"⚙",visual:"gear",x:78,y:73,knowledge:"fact",detail:"يحوّل حركة المكبس إلى دوران."}
   ],
   edges:[
    {id:"e1",from:"intake",to:"cylinder",label:"سحب",relation:"flow",causal:true,knowledge:"fact"},
    {id:"e2",from:"spark",to:"piston",label:"تمدد الغازات",relation:"cause",causal:true,knowledge:"fact"},
    {id:"e3",from:"piston",to:"crankshaft",label:"تحويل الحركة",relation:"transform",causal:true,knowledge:"fact"}
   ]
  },
  steps:[
   {title:"السحب",text:"يدخل خليط الهواء والوقود إلى الأسطوانة.",focusNodeIds:["intake","cylinder"],activeEdgeIds:["e1"],motion:"travel"},
   {title:"الضغط",text:"يصعد المكبس فيضغط الخليط.",focusNodeIds:["cylinder","piston"],activeEdgeIds:[],motion:"compress"},
   {title:"القدرة",text:"الإشعال يسبب احتراق الخليط وتمدد الغازات فيدفع المكبس.",focusNodeIds:["spark","piston"],activeEdgeIds:["e2"],motion:"burst"},
   {title:"تحويل الحركة",text:"ينقل المكبس حركته إلى عمود المرفق فيدور.",focusNodeIds:["piston","crankshaft"],activeEdgeIds:["e3"],motion:"connect"},
   {title:"العادم",text:"تُطرد غازات الاحتراق وتبدأ الدورة من جديد.",focusNodeIds:["cylinder"],activeEdgeIds:[],motion:"reveal"}
  ]
 }
];

const normalize=value=>String(value||"").toLowerCase().replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ").trim();

function score(question,pack){
 const q=normalize(question);
 return pack.keywords.reduce((n,k)=>n+(q.includes(normalize(k))?1:0),0);
}

function toExperience(pack){
 return {
  mode:"curated",
  title:pack.title,
  summary:pack.answer,
  truthAnchors:pack.truthAnchors,
  visual:"flow",
  audience:"عام",
  sceneGraph:pack.sceneGraph,
  steps:pack.steps,
  sources:pack.sources,
  runtimeVersion:"curated-scene/v1"
 };
}

export function curatedKnowledgeResult(question){
 const ranked=packs.map(pack=>({pack,score:score(question,pack)})).sort((a,b)=>b.score-a.score);
 const best=ranked[0];
 if(!best||best.score===0)return null;
 const p=best.pack;
 return {
  domain:p.domain,
  topic:p.id,
  answer:p.answer,
  explanation:p.explanation,
  scene:null,
  confidence:"high",
  needsVerification:false,
  visualPlan:p.visualPlan,
  verification:{
   status:"source-grounded",
   source:"NAHLATY curated knowledge pack v1",
   sources:p.sources,
   note:"Facts in this pack were curated against the listed authoritative references."
  },
  experience:toExperience(p)
 };
}

export function listCuratedKnowledgePacks(){
 return packs.map(p=>({id:p.id,title:p.title,domain:p.domain,sources:p.sources.length}));
}
