// Route established educational lessons only. Clinical questions retain the
// general engine contract; these lessons cannot answer diagnosis or treatment.
export function isClinicalHeartInput(value){
 return /(?:علاج|أعالج|اعالج|تشخيص|دواء|أدوية|ادوية|ألم|الم الصدر|نوبة|جلطة|جراحة|مرض|قصور|فشل|انسداد|تضيق|ارتجاع|diagnos|treat|medicat|chest pain|heart attack|disease|surgery|failure|stenosis|regurgitation|arrhythmia)/i.test(String(value||""));
}

export function isHeartLessonInput(value){
 const input=String(value||"").replace(/[ًٌٍَُِّْـ]/g,"").trim();
 if(!input||isClinicalHeartInput(input))return false;
 if(/(?:زهرة|زهر|نبات|مياه|الماء|دراجة|سيارة|محرك|flower|plant|water|bicycle|car engine)/i.test(input))return false;
 return /(?:قلب|heart|صمام|صمامات|أذين|اذين|بطين|تاجي|تاجية|الأبهر|الأبهري|الوريد الأجوف|الوريدان الأجوفان|الشريان الرئوي|الأوردة الرئوية|الدورة الرئوية|الدورة الدموية|رحلة الدم|مسار الدم|cardiac|atri(?:um|a)|ventric|coronary|mitral|tricuspid|aorta|aortic valve|pulmonary|vena(?:e)? cava|blood circulation|blood flow)/i.test(input);
}

export function isHeartLessonQuestion(value){
 const input=String(value||"").trim();
 if(input.length>240||/[\n:]/.test(input)||/(?:النص التالي|المحتوى التالي|المرفق|المطلوب|following text|attached|provided content)/i.test(input))return false;
 return isHeartLessonInput(input)&&(/^(?:كيف|لماذا|ليش|ما |ماذا|هل |شو |أين|متى|من |اشرح|وضح|what |why |how |where |when |who |explain |describe )/i.test(input)||/[؟?]$/.test(input));
}
