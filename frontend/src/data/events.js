
export const GRADES = {
  primary: { label: "小学", range: "1—6年级", defaultGradeNumber: 1 },
  middle: { label: "初中", range: "7—9年级", defaultGradeNumber: 7 },
  high: { label: "高中", range: "高1—高3", defaultGradeNumber: 10 },
  voc: { label: "中等职业", range: "中职在校", defaultGradeNumber: 10 }
};

export const CAP_META = {
  text:{label:"文本创作",icon:"ti-text-size",color:"#7F77DD",api:"Ark · Text"},
  image:{label:"图像生成",icon:"ti-photo",color:"#378ADD",api:"Ark · Vision/Image"},
  audio:{label:"音频生成",icon:"ti-music",color:"#1D9E75",api:"Ark · Audio"},
  video:{label:"视频生成",icon:"ti-video",color:"#BA7517",api:"Ark · Video"},
  code:{label:"交互代码",icon:"ti-terminal",color:"#0F6E56",api:"Ark · Code"}
};

export const EVENTS = {
  primary:[
    {id:"P1",name:"AI与图像生成表达",caps:["image"],main:"image"},
    {id:"P2",name:"AI与影像生成表达",caps:["image","video"],main:"video"},
    {id:"P3",name:"AI与音频生成表达",caps:["audio"],main:"audio"},
    {id:"P4",name:"AI与文本生成表达",caps:["text"],main:"text"}
  ],
  middle:[
    {id:"M1",name:"AI与造型艺术",caps:["image"],main:"image"},
    {id:"M2",name:"AI与影像艺术",caps:["video","image","audio","text"],main:"video"},
    {id:"M3",name:"AI与时尚角色造型",caps:["image","text"],main:"image"},
    {id:"M4",name:"AI与视觉设计",caps:["image","text"],main:"image"},
    {id:"M5",name:"AI与非物质文化遗产",caps:["image","text","audio","video"],main:"image"},
    {id:"M6",name:"AI与音频艺术",caps:["audio"],main:"audio"},
    {id:"M7",name:"AI与诗歌和戏剧",caps:["text","audio"],main:"text"}
  ],
  high:[
    {id:"H1",name:"AI与造型艺术",caps:["image"],main:"image"},
    {id:"H2",name:"AI与空间艺术",caps:["image","text"],main:"image"},
    {id:"H3",name:"AI与时尚艺术",caps:["image","text"],main:"image"},
    {id:"H4",name:"AI与影像艺术",caps:["video","image","audio","text"],main:"video"},
    {id:"H5",name:"AI与视觉传达",caps:["image","text"],main:"image"},
    {id:"H6",name:"AI与产品设计艺术",caps:["image","text","code"],main:"image"},
    {id:"H7",name:"AI与游戏化创新",caps:["image","text","code"],main:"image"},
    {id:"H8",name:"AI与非物质文化遗产",caps:["image","text","audio","video"],main:"image"},
    {id:"H9",name:"AI与音频艺术",caps:["audio","text","video"],main:"audio"},
    {id:"H10",name:"AI与未来综合创新",caps:["text","image","video","audio","code"],main:"text"}
  ],
  voc:[
    {id:"V1",name:"AI与造型艺术",caps:["image"],main:"image"},
    {id:"V2",name:"AI与摄影艺术",caps:["image","text"],main:"image"},
    {id:"V3",name:"AI与数字动漫艺术",caps:["image","video"],main:"video"},
    {id:"V4",name:"AI与影像艺术",caps:["video","image","audio"],main:"video"},
    {id:"V5",name:"AI与视觉传达",caps:["image","text"],main:"image"},
    {id:"V6",name:"AI与产品设计艺术",caps:["image","text","code"],main:"image"},
    {id:"V7",name:"AI与数字媒体艺术",caps:["code","image","audio","video"],main:"code"},
    {id:"V8",name:"AI与非物质文化遗产",caps:["image","text","audio","video"],main:"image"},
    {id:"V9",name:"AI与音频艺术",caps:["audio","text"],main:"audio"},
    {id:"V10",name:"AI与诗歌和戏剧",caps:["text","audio","video"],main:"text"}
  ]
};

export const CHECKLIST = [
  {key:"main",label:"主作品文件",sub:"JPG≥1920×1080", status:"idle"},
  {key:"aigc",label:"AIGC截图",sub:"含提示词输入框，建议≥3张", status:"warn"},
  {key:"draft",label:"手绘草稿",sub:"至少1张过程材料", status:"idle"},
  {key:"desc",label:"创作说明",sub:"30—100字", status:"idle"},
  {key:"zip",label:"ZIP打包命名",sub:"学段_作品名_序号.zip", status:"idle"}
];

export const P1_PROMPT_PACKS = [
  { id:"image_size", name:"画面大小", tier:"basic", items:[
    ["1:1方形图","方形画面，适合头像、封面和课堂展示",0],
    ["3:4竖版图","竖版画面，适合人物、海报和故事图",0],
    ["16:9横屏图","横屏画面，适合故事场景和PPT展示",1],
    ["故事卡片","一张图讲一个小故事",3],
    ["图文说明卡","图片加一句说明文字",5]
  ]},
  { id:"picture_subject", name:"画面主题", tier:"basic", items:[
    ["可爱动物","小猫、小狗、小兔、小鸟等可爱动物",10],
    ["童话城堡","城堡、森林、彩虹和童话世界",15],
    ["未来机器人","一个友好的机器人伙伴",20],
    ["环保小卫士","保护森林、海洋和动物的小角色",25],
    ["传统节日","春节、中秋、端午等节日画面",20]
  ]},
  { id:"art_style", name:"画面风格", tier:"basic", items:[
    ["儿童绘本","像儿童绘本一样温暖、可爱、清楚",10],
    ["彩色蜡笔","蜡笔质感，颜色活泼，有手绘感",10],
    ["水彩画","柔和水彩，适合童话和自然主题",15],
    ["卡通风","线条清楚、颜色明亮、适合角色",15],
    ["黏土玩具","像彩色黏土小玩具一样立体可爱",20]
  ]},
  { id:"story_help", name:"故事小帮手", tier:"advanced", items:[
    ["一句话故事","给图片生成一句话故事说明",50],
    ["角色名字","给画面里的角色取一个名字",40],
    ["三句话故事","用三句话讲清楚开头、经过、结果",100],
    ["作品说明卡","生成适合小学生展示的说明卡",80]
  ]}
];

export function findEvent(gradeKey, eventId) {
  return (EVENTS[gradeKey] || []).find(e => e.id === eventId) || EVENTS.primary[0];
}
