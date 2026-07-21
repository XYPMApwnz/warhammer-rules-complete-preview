(function(){
  'use strict';
  window.DG_TERMS=Object.freeze({
    'core-heavy':{title:'Heavy',summary:'A ranged weapon ability granted by Protector Imperative.',glossary:'glossary-core-heavy',rule:'protector-imperative',related:['core-assault']},
    'core-assault':{title:'Assault',summary:'A ranged weapon ability granted by Conqueror Imperative.',glossary:'glossary-core-assault',rule:'conqueror-imperative',related:['core-heavy']},
    'core-ignores-cover':{title:'Ignores Cover',summary:'The target cannot have the Benefit of Cover against this attack.',rule:'cohort-acquisitus-stratagems',related:['core-stealth']},
    'core-feel-no-pain':{title:'Feel No Pain',summary:'Each time the model would lose a wound, roll one D6; on the listed result that wound is not lost.',rule:'lords-of-the-forge-rule'},
    'core-lethal-hits':{title:'Lethal Hits',summary:'A Critical Hit automatically wounds the target.',rule:'luminen-auto-choir-rule'},
    'core-stealth':{title:'Stealth',summary:'A defensive core ability available through several Mechanicus protocols.',glossary:'glossary-core-stealth',rule:'haloscreed-battle-clade-rule',related:['core-ignores-cover']},
    'core-devastating-wounds':{title:'Devastating Wounds',summary:'A Critical Wound inflicts mortal wounds according to the current core rule.',glossary:'glossary-core-devastating-wounds',datasheet:'unit-thulia-ghuld',statline:'thulia-profile',units:['unit-thulia-ghuld','unit-hastarii-exterminators']},
    'core-anti-vehicle':{title:'Anti-Vehicle 4+',summary:'An unmodified Wound roll of 4+ against a VEHICLE scores a Critical Wound.',datasheet:'unit-hastarii-exterminators',statline:'exterminators-profile',units:['unit-hastarii-exterminators']},
    'weapon-jericho-impact':{title:'Jericho-class conversion resonator — titanic impact',summary:'Range 24″ · A 2 · BS 2+ · S 12 · AP -3 · D D6+2 · Devastating Wounds.',datasheet:'unit-thulia-ghuld',statline:'thulia-profile',related:['core-devastating-wounds']},
    'weapon-hastarii-arc-blaster':{title:'Hastarii arc blaster',summary:'Range 18″ · A 1 · BS 4+ · S 6 · AP -1 · D 2 · Anti-Vehicle 4+, Devastating Wounds.',datasheet:'unit-hastarii-exterminators',statline:'exterminators-profile',related:['core-anti-vehicle','core-devastating-wounds']},
    'weapon-neutron-fusil':{title:'Neutron fusil',summary:'Range 24″ · A 1 · BS 4+ · S 12 · AP -3 · D D6+1.',datasheet:'unit-hastarii-fusiliers',statline:'fusiliers-profile'}
  });
}());
