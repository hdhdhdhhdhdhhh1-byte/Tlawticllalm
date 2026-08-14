import React from 'react';
import { BookOpen, Shield, Globe, Award, Sparkles, Heart, CheckCircle2, Mic2, Layers } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#102A20] via-[#1A3F31] to-[#315F4A] text-white p-6 sm:p-8 rounded-3xl border border-[#C9A961]/30 shadow-md text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#C9A961]/20 border border-[#C9A961]/50 flex items-center justify-center mx-auto text-[#F4E8CE]">
          <BookOpen className="w-8 h-8 text-[#C9A961]" />
        </div>
        <h2 className="text-3xl font-bold font-amiri text-[#FAFBF9]">
          تلاوتك للعالم
        </h2>
        <p className="text-[#C9A961] font-semibold text-base font-tajawal">
          "انشر تلاوتك... واكتشف أصوات القرآن من حول العالم"
        </p>
        <p className="text-xs sm:text-sm text-[#E2E5DF]/80 max-w-xl mx-auto leading-relaxed pt-2">
          منصة قرآنية عالمية متخصصة تهدف إلى إبراز وتوثيق أصوات القراء وتلاوات كتاب الله بمختلف الروايات، وإتاحة الفرصة للمواهب القرآنية لإيصال أصواتهم للعالم بعد المراجعة والاعتماد.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E5DF] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#315F4A]/10 text-[#315F4A] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#102A20] font-amiri">
            خدمة كتاب الله الكريم
          </h3>
          <p className="text-xs text-[#7A847E] leading-relaxed">
            الهدف الأسمى للمنصة هو نشر القرآن الكريم بتلاوات خاشعة وصحيحة التجويد، بعيداً عن الطابع التجاري أو الترفيهي المبتذل.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E5DF] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#315F4A]/10 text-[#315F4A] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#102A20] font-amiri">
            التدقيق والمراجعة قبل النشر
          </h3>
          <p className="text-xs text-[#7A847E] leading-relaxed">
            تخضع جميع التلاوات المرسلة لتقييم دقيق من لجنة مختصة للتأكد من سلامة الأحكام التجويدية ونقاء الصوت قبل اعتمادها داخل التطبيق.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E5DF] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#315F4A]/10 text-[#315F4A] flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#102A20] font-amiri">
            وصول عالمي ومتعدد الروايات
          </h3>
          <p className="text-xs text-[#7A847E] leading-relaxed">
            احتضان التلاوات بمختلف الروايات القرآنية المتواترة (حفص، ورش، قالون، الدوري...) ومن مختلف بلدان وقارات العالم.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E5DF] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#315F4A]/10 text-[#315F4A] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#102A20] font-amiri">
            حفظ الخصوصية والأسماء المستعارة
          </h3>
          <p className="text-xs text-[#7A847E] leading-relaxed">
            إتاحة الخيار للقراء بالمشاركة بأسمائهم الصريحة أو المستعارة ابتغاء الأجر، مع حماية تامة لبياناتهم ومعلومات الاتصال الخاصة.
          </p>
        </div>
      </div>

      {/* Visual Identity & Architecture Specification Note */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E5DF] space-y-4">
        <h3 className="font-bold text-base text-[#102A20] font-amiri flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#315F4A]" />
          <span>الهوية البصرية والمعايير المعمارية</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
          <div className="p-3 rounded-xl bg-[#315F4A] text-white">
            <span className="block font-bold">#315F4A</span>
            <span className="text-[10px] opacity-80">الأخضر الأساسي</span>
          </div>
          <div className="p-3 rounded-xl bg-[#102A20] text-white">
            <span className="block font-bold">#102A20</span>
            <span className="text-[10px] opacity-80">الأخضر الداكن</span>
          </div>
          <div className="p-3 rounded-xl bg-[#C9A961] text-[#102A20]">
            <span className="block font-bold">#C9A961</span>
            <span className="text-[10px] opacity-80">الذهب القرآني</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFBF9] text-[#102A20] border border-[#E2E5DF]">
            <span className="block font-bold">#FAFBF9</span>
            <span className="text-[10px] opacity-80">خلفية ناصعة</span>
          </div>
        </div>

        <p className="text-xs text-[#7A847E] leading-relaxed">
          تم تصميم وبناء هذه المنصة وفق أعلى معايير أندرويد الحديثة (Modern Android Architecture)، باستخدام Clean Architecture مع فصل طبقات UI والـ Domain والـ Data، وتوفير تجربة عربية أصلية RTL كاملة الاستجابة للهواتف والأجهزة اللوحية.
        </p>
      </div>
    </div>
  );
};
