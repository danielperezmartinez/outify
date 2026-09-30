// Compone el vídeo final y una vista previa autónoma de la demo clicable.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const output = resolve('tmp/Outify-Product-Hunt-Media');
const work = resolve('tmp/launch-video-work');
const imageData = async (path) =>
  `data:image/png;base64,${(await readFile(path)).toString('base64')}`;
const fonts = `@font-face{font-family:Geologica;src:url(data:font/woff2;base64,${(await readFile('public/fonts/font-4.woff2')).toString('base64')})}@font-face{font-family:Atkinson;src:url(data:font/woff2;base64,${(await readFile('public/fonts/font-2.woff2')).toString('base64')})}`;
const mark = await readFile('public/brand/symbol.svg', 'utf8');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
async function poster(name, content, extra = '') {
  await page.setContent(
    `<!doctype html><html lang="en"><meta charset="utf-8"><style>${fonts}*{box-sizing:border-box}body{margin:0;background:#F8F7F5;color:#292724;width:1920px;height:1080px;overflow:hidden;font-family:Atkinson}h1,h2,.brand{font-family:Geologica;font-weight:400}.brand{font-size:44px;display:flex;align-items:center;gap:15px;letter-spacing:-2px}.brand svg{width:53px;height:53px}.eyebrow{font-size:18px;letter-spacing:3px;text-transform:uppercase}p{line-height:1.45}.rule{height:1px;background:#B6B0A8}${extra}</style><body>${content}</body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
  await page.screenshot({ path: `${work}/${name}.png` });
}
const art = await Promise.all(
  ['shirt', 'tee', 'bag'].map((s) => imageData(`public/launch/demo/${s}.png`)),
);
await poster(
  'intro',
  `<header class="brand">${mark}outify</header><div class="eyebrow">A visual wardrobe inventory</div><h1>Know what<br>you own.<br><span>Find where<br>it lives.</span></h1><p class="sub">A little order.<br>A lot less searching.</p><section class="closet"><div class="label">YOUR EVERYDAY COLLECTION <span>01 / 03</span></div><div class="rail"></div><div class="clothes"><img src="${art[0]}"><img src="${art[1]}"></div><div class="shelf"><img src="${art[2]}"><p>Every piece.<br>Its own place.</p></div></section><footer>Free at launch · App in Spanish</footer>`,
  `header{position:absolute;left:96px;top:70px}.eyebrow{position:absolute;left:100px;top:205px}h1{position:absolute;left:92px;top:234px;font-size:104px;line-height:1.05;letter-spacing:-5px;margin:0}h1 span{color:#52664E}.sub{position:absolute;left:100px;top:735px;font-size:29px}.closet{position:absolute;right:100px;top:140px;width:770px;height:800px;padding:34px;background:#DEE7D8;border:1px solid #A8B4A3;border-radius:190px 190px 12px 12px}.label{margin:50px 50px 30px;font-size:15px;letter-spacing:2px}.label span{float:right}.rail{height:3px;background:#52664E;margin:10px 20px}.clothes{display:flex;justify-content:center;gap:20px}.clothes img{width:275px;height:310px;object-fit:cover;margin-top:25px;border:1px solid #B6B0A8}.shelf{border-top:3px solid #52664E;margin:35px 20px 0;padding-top:25px;display:flex;align-items:center;gap:65px}.shelf img{width:160px;height:180px;object-fit:cover}.shelf p{font:400 37px/1.25 Geologica;color:#334231}footer{position:absolute;left:100px;bottom:60px;font-size:20px}`,
);
const chapters = [
  [
    '01-overview',
    'SEE YOUR SPACE',
    'Your wardrobe,<br>at a glance.',
    'See your sections.<br>Keep clothes in view.',
  ],
  [
    '02-inventory',
    'KNOW YOUR CLOTHES',
    'Remember<br>what you own.',
    'Find a piece.<br>Keep its details close.',
  ],
  [
    '03-location',
    'GIVE IT A HOME',
    'Every item.<br>Its own place.',
    'Choose a section.<br>Find it on your map.',
  ],
  [
    '04-editor',
    'MAKE IT YOURS',
    'A little room<br>to rearrange.',
    'Resize your zones.<br>Undo. Redo. Try again.',
  ],
];
for (let i = 0; i < chapters.length; i++) {
  const [name, eyebrow, title, subtitle] = chapters[i];
  await poster(
    name,
    `<header class="brand">${mark}outify</header><div class="chapter">0${i + 1}<span> / 04</span></div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="sub">${subtitle}</p><div class="window"></div><div class="window-top"><i></i><i></i><i></i><span>OUTIFY / PRODUCT TOUR</span></div><footer><span>Actual app · Sample inventory</span><span>App in Spanish · English tour</span></footer><div class="side-note">A place for<br>everything.<div class="rule"></div>outify.vercel.app</div>`,
    `header{position:absolute;left:48px;top:52px;font-size:36px}header svg{width:44px;height:44px}.chapter{position:absolute;left:48px;top:175px;font:400 95px Geologica;color:#52664E;letter-spacing:-6px}.chapter span{font-size:21px;letter-spacing:0;color:#716D6C}.eyebrow{position:absolute;left:50px;top:327px;font-size:14px;letter-spacing:2px}h1{position:absolute;left:45px;top:369px;width:350px;font-size:48px;line-height:1.13;letter-spacing:-2px;margin:0}.sub{position:absolute;left:50px;top:559px;font-size:26px;color:#4F4B46;line-height:1.55}.window{position:absolute;left:430px;top:110px;width:1444px;height:904px;border:2px solid #B6B0A8;background:#fff}.window-top{position:absolute;left:430px;top:65px;width:1444px;height:45px;border:1px solid #B6B0A8;border-bottom:0;padding:14px 18px;display:flex;align-items:center;gap:9px}.window-top i{width:8px;height:8px;border-radius:100%;background:#B6B0A8}.window-top span{font-size:12px;letter-spacing:2px;margin-left:470px;color:#4F4B46}footer{position:absolute;left:432px;right:48px;bottom:22px;display:flex;justify-content:space-between;font-size:17px;color:#4F4B46}.side-note{position:absolute;left:50px;bottom:65px;font-size:22px;line-height:1.5;color:#52664E}.side-note .rule{width:290px;margin:23px 0}.side-note{font-size:20px}`,
  );
}
await poster(
  'outro',
  `<header class="brand">${mark}outify</header><div class="eyebrow">Your clothes. Your space.</div><h1>Know what you own.<br><span>Find where it lives.</span></h1><div class="url">outify.vercel.app <span>↗</span></div><p>Free at launch · Google sign-in · App in Spanish</p><footer>Actual app shown with a sample inventory and original illustrations.<br>Saved outfits are a future idea, not part of this release.</footer>`,
  `body{background:#DEE7D8}header{position:absolute;left:96px;top:70px}.eyebrow{position:absolute;left:100px;top:284px;color:#334231}h1{position:absolute;left:90px;top:338px;font-size:108px;line-height:1.12;letter-spacing:-5px;margin:0}h1 span{color:#52664E}.url{position:absolute;left:100px;top:670px;font:400 42px Geologica;border-bottom:2px solid #52664E;padding-bottom:20px;width:700px}.url span{float:right}p{position:absolute;left:100px;top:781px;font-size:25px}footer{position:absolute;left:100px;bottom:50px;font-size:18px;line-height:1.5;color:#4F4B46}`,
);
await browser.close();

const steps = JSON.parse(await readFile(`${output}/arcade/steps.json`, 'utf8'));
const embedded = await Promise.all(
  steps.map(async (s) => ({ ...s, image: await imageData(`${output}/arcade/${s.file}`) })),
);
const template = await readFile('scripts/launch-demo-template.html', 'utf8');
await writeFile(
  `${output}/Outify-Interactive-Demo.html`,
  template
    .replace('/* FONT_DATA */', fonts)
    .replace('<!-- BRAND -->', mark)
    .replace('/* STEP_DATA */', JSON.stringify(embedded)),
);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let error = '';
    child.stderr.on('data', (data) => (error += data));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(error.slice(-5000)))));
  });
}
const scenes = JSON.parse(await readFile(`${work}/scenes.json`, 'utf8'));
const encode = [
  '-an',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  '-r',
  '30',
  '-movflags',
  '+faststart',
];
const segments = [];
await run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-loop',
  '1',
  '-framerate',
  '30',
  '-i',
  `${work}/intro.png`,
  '-t',
  '4',
  '-vf',
  'fade=t=in:st=0:d=0.35,fade=t=out:st=3.8:d=0.2',
  ...encode,
  `${work}/intro.mp4`,
]);
segments.push(`${work}/intro.mp4`);
for (const scene of scenes) {
  const duration = Math.round(scene.duration * 30) / 30;
  const filter = `[1:v]fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=1[app];[0:v][app]overlay=432:112:shortest=1,fade=t=in:st=0:d=0.2,fade=t=out:st=${duration - 0.2}:d=0.2[v]`;
  const file = `${work}/${scene.name}.mp4`;
  await run('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-loop',
    '1',
    '-framerate',
    '30',
    '-i',
    `${work}/${scene.name}.png`,
    '-ss',
    String(scene.start),
    '-i',
    scene.raw,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    '-t',
    String(duration),
    ...encode,
    file,
  ]);
  segments.push(file);
  console.log(`Compuesta ${scene.name}`);
}
await run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-loop',
  '1',
  '-framerate',
  '30',
  '-i',
  `${work}/outro.png`,
  '-t',
  '5',
  '-vf',
  'fade=t=in:st=0:d=0.2,fade=t=out:st=4.65:d=0.35',
  ...encode,
  `${work}/outro.mp4`,
]);
segments.push(`${work}/outro.mp4`);
await writeFile(
  `${work}/concat.txt`,
  segments.map((p) => `file '${p.replaceAll('\\', '/')}'`).join('\n'),
);
await run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  `${work}/concat.txt`,
  '-c',
  'copy',
  '-movflags',
  '+faststart',
  `${output}/Outify-Product-Tour.mp4`,
]);
await writeFile(
  `${output}/video-description.txt`,
  'Outify — Know what you own. Find where it lives.\n\nA visual wardrobe inventory: explore your clothes, give each item a place and shape a map of your closets.\n\nTry Outify: https://outify.vercel.app/en\nFree at launch. Google sign-in. The app is currently in Spanish.\n\nThis walkthrough shows the real interface with a local sample inventory and original clothing illustrations. Saved outfits are a future idea and are not available in this release.\n',
);
console.log(`Vídeo y demo preparados en ${output}`);
