#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const output = join(root, 'public', 'images', 'entries');
mkdirSync(output, { recursive: true });

const cthulhu = [
  ['rlyeh', "R'LYEH", 'city', '#54857e'],
  ['necronomicon', 'NECRONOMICON', 'book', '#a27258'],
  ['elder-sign', 'ELDER SIGN', 'sigil', '#8f9b71'],
  ['arkham', 'ARKHAM', 'map', '#9a765c'],
  ['innsmouth', 'INNSMOUTH', 'harbor', '#668d91'],
  ['miskatonic-university', 'MISKATONIC UNIVERSITY', 'tower', '#947653'],
  ['dreamlands', 'DREAMLANDS', 'dream', '#82749f'],
];

const scp = [
  ['scp-055', 'SCP-055', 'void', '#8c97a3'],
  ['scp-087', 'SCP-087', 'stairs', '#8792a0'],
  ['scp-173', 'SCP-173', 'concrete', '#a2947f'],
  ['scp-914', 'SCP-914', 'gears', '#a68a61'],
  ['scp-2000', 'SCP-2000', 'vault', '#6f91a5'],
];

function organicMotif(kind, color) {
  const stroke = `stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const thin = `stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".65"`;
  const motifs = {
    tentacles: `<circle cx="450" cy="470" r="116" ${stroke}/><path d="M380 438c-88-92-169-21-126 50 28 47 107 12 78-33M520 438c88-92 169-21 126 50-28 47-107 12-78-33M405 548c-34 75-83 90-113 57-24-27 4-63 41-41M450 564c0 111-46 143-83 112M495 548c34 75 83 90 113 57 24-27-4-63-41-41" ${stroke}/><path d="M397 442c28-38 78-38 106 0M410 487c25 22 55 22 80 0" ${thin}/>`,
    chaos: `<g ${stroke}><path d="M450 260c34 82 85 91 142 43-30 89 8 124 91 127-73 50-70 101-5 158-91-15-118 27-104 113-68-61-112-42-143 38-34-82-85-91-142-43 30-89-8-124-91-127 73-50 70-101 5-158 91 15 118-27 104-113 68 61 112 42 143-38Z"/><circle cx="450" cy="500" r="54"/><path d="M450 301v137M559 344l-74 114M620 445l-126 38M606 565l-116-44M522 666l-51-123M401 674l33-131M307 598l104-73M279 482l132 9M337 374l91 78" ${thin}/></g>`,
    orbs: `<g ${stroke}><circle cx="450" cy="498" r="172"/><circle cx="360" cy="424" r="102"/><circle cx="542" cy="415" r="74"/><circle cx="548" cy="570" r="116"/><circle cx="360" cy="590" r="58"/></g><path d="M302 498h296M450 326v344M344 364l212 268M330 620l240-236" ${thin}/>`,
    mask: `<path d="M450 282c-116 0-177 89-160 207 18 126 92 226 160 226s142-100 160-226c17-118-44-207-160-207Z" ${stroke}/><path d="M337 451c40-37 78-35 110 5-41 26-80 25-110-5Zm116 5c32-40 70-42 110-5-30 30-69 31-110 5ZM412 606l38-23 38 23" ${stroke}/><path d="M450 282v301M326 382c73-34 175-34 248 0" ${thin}/><rect x="272" y="344" width="356" height="54" fill="#090b0e" opacity=".85"/>`,
    horns: `<path d="M390 520C253 462 259 307 335 257c-19 97 43 124 89 153M510 520c137-58 131-213 55-263 19 97-43 124-89 153" ${stroke}/><path d="M450 382c-102 72-104 207 0 304 104-97 102-232 0-304Z" ${stroke}/><path d="M450 442v189M401 499l49 37 49-37" ${thin}/>`,
    fish: `<path d="M250 508c111-132 287-132 400 0-113 132-289 132-400 0Z" ${stroke}/><circle cx="365" cy="495" r="20" fill="${color}"/><path d="M650 508l93-96v192l-93-96ZM451 377c-24 60-19 101 14 131-35 26-43 68-25 126M292 459c65 24 88 71 63 142" ${stroke}/>`,
    hydra: `<path d="M450 680V461M450 492c-105-17-163-82-152-172 92 16 145 68 152 172Zm0-31c105-17 163-82 152-172-92 16-145 68-152 172Zm-34 65c-121 23-163 97-125 181 87-30 128-85 125-181Zm68 0c121 23 163 97 125 181-87-30-128-85-125-181Z" ${stroke}/><circle cx="450" cy="417" r="58" ${stroke}/>`,
    shoal: `<path d="M235 398c90-89 205-89 294 0-89 89-204 89-294 0Zm136 222c90-89 205-89 294 0-89 89-204 89-294 0Z" ${stroke}/><path d="M529 398l89-75v150l-89-75ZM371 620l-89-75v150l89-75Z" ${stroke}/><circle cx="332" cy="388" r="14" fill="${color}"/><circle cx="568" cy="610" r="14" fill="${color}"/>`,
    'elder-star': `<path d="M450 236l63 187 197-3-157 119 65 185-168-113-168 113 65-185-157-119 197 3 63-187Z" ${stroke}/><circle cx="450" cy="504" r="74" ${thin}/><path d="M450 430v148M376 504h148" ${thin}/>`,
    ooze: `<path d="M284 589c-37-130 30-270 166-270 141 0 210 139 166 270-28 84-103 108-166 73-63 35-138 11-166-73Z" ${stroke}/><g fill="${color}"><circle cx="367" cy="467" r="23"/><circle cx="467" cy="403" r="17"/><circle cx="535" cy="493" r="30"/><circle cx="411" cy="578" r="14"/></g><path d="M318 620c-38 61-15 104 26 81 30-17 36-61 12-100M579 611c47 49 35 98-9 86-35-10-50-50-34-96" ${stroke}/>`,
    fungus: `<path d="M450 696V490M335 486c0-111 230-111 230 0-68 39-162 39-230 0Z" ${stroke}/><path d="M397 483c13-95 35-159 53-209 18 50 40 114 53 209M398 602l-78 74M502 602l78 74M410 533l-96-21M490 533l96-21" ${thin}/><circle cx="377" cy="430" r="12" fill="${color}"/><circle cx="466" cy="395" r="16" fill="${color}"/><circle cx="524" cy="448" r="10" fill="${color}"/>`,
    cone: `<path d="M450 258 270 704h360L450 258Z" ${stroke}/><path d="M336 541h228M312 607h276M390 407h120" ${thin}/><circle cx="450" cy="338" r="34" ${stroke}/><path d="M450 704v72M362 704l-49 72M538 704l49 72" ${stroke}/>`,
    serpent: `<path d="M298 660c265 72 365-33 275-118-71-67-226 5-198 87 33 96 244 9 203-161-35-146-255-146-257-18-1 88 133 111 179 35 46-75-3-178-91-161-64 13-75 98-22 129" ${stroke}/><path d="M378 328l39-73 66 53-72 35" ${stroke}/><circle cx="429" cy="300" r="8" fill="${color}"/>`,
    skull: `<path d="M450 286c-112 0-181 80-176 190 4 82 49 134 101 158v85h150v-85c52-24 97-76 101-158 5-110-64-190-176-190Z" ${stroke}/><circle cx="370" cy="475" r="49" ${stroke}/><circle cx="530" cy="475" r="49" ${stroke}/><path d="M450 504l-31 79h62l-31-79ZM399 635v84M433 635v84M467 635v84M501 635v84" ${stroke}/>`,
    wings: `<path d="M438 584c-101 72-222 15-247-104 94-9 173 24 247 104Zm24 0c101 72 222 15 247-104-94-9-173 24-247 104Z" ${stroke}/><path d="M450 334c-59 82-57 221 0 335 57-114 59-253 0-335Z" ${stroke}/><path d="M450 368l-67-91M450 368l67-91M335 522l-99-77M565 522l99-77" ${thin}/>`,
    city: `<path d="M239 688h422M278 688V496l84-77 50 45 70-116 63 82 77 66v192" ${stroke}/><path d="M323 688V568h75v120M486 688V516h77v172M362 419l18-113 32 158M482 348l5-113 58 195" ${thin}/><path d="M236 738c140-38 288-38 428 0" ${stroke}/>`,
    book: `<path d="M450 346c-78-53-160-58-246-14v347c91-41 173-31 246 22 73-53 155-63 246-22V332c-86-44-168-39-246 14Z" ${stroke}/><path d="M450 346v355M257 406c58-22 106-16 146 16M257 470c58-22 106-16 146 16M497 422c40-32 88-38 146-16M497 486c40-32 88-38 146-16" ${thin}/><circle cx="450" cy="512" r="47" ${stroke}/>`,
    sigil: `<circle cx="450" cy="500" r="222" ${stroke}/><path d="M450 289l52 147 156 4-124 95 45 150-129-89-129 89 45-150-124-95 156-4 52-147Z" ${stroke}/><circle cx="450" cy="500" r="67" ${thin}/><path d="M450 278v444M228 500h444" ${thin}/>`,
    map: `<path d="M252 306c81 39 140 26 198-25 58 51 117 64 198 25v390c-81-39-140-26-198 25-58-51-117-64-198-25V306Z" ${stroke}/><path d="M450 281v440M324 357c46 24 80 20 105-14M478 438c45 39 84 42 118 8M301 570c52-30 97-31 137-5M491 610c34 16 65 14 93-6" ${thin}/><circle cx="383" cy="492" r="18" fill="${color}"/>`,
    harbor: `<path d="M215 651c83-42 161-42 235 0 74-42 152-42 235 0M229 706c77-39 151-39 221 0 70-39 144-39 221 0" ${stroke}/><path d="M327 606V336h179v270M364 336v-72h105v72M522 606V434h92v172M284 606V476h43" ${stroke}/><circle cx="416" cy="408" r="25" ${thin}/>`,
    tower: `<path d="M328 704h244L541 345h-55v-91h-72v91h-55l-31 359Z" ${stroke}/><path d="M375 704V492h150v212M414 430h72M407 560h86" ${thin}/><circle cx="450" cy="302" r="19" fill="${color}"/>`,
    dream: `<path d="M290 540c78-193 242-243 386-121-80 205-246 248-386 121Z" ${stroke}/><circle cx="481" cy="485" r="79" ${stroke}/><path d="M199 671c88-47 177-47 266 0 88-47 177-47 266 0M249 719c66-35 133-35 199 0 66-35 133-35 199 0" ${thin}/><path d="M348 376c-18-55 9-98 58-123M591 359c20-48 4-88-43-120" ${stroke}/>`,
    prism: `<path d="M450 257 238 695h424L450 257Z" ${stroke}/><path d="M281 606 161 556M619 606l120 50M323 519l-144-8M577 519l144-8" ${stroke}/><path d="M450 257v438M238 695l424-438M662 695 238 257" ${thin}/><circle cx="450" cy="515" r="34" fill="${color}" opacity=".8"/>`,
    crown: `<path d="M256 604 213 354l153 111 84-196 84 196 153-111-43 250H256Z" ${stroke}/><path d="M273 668h354M290 604v64M610 604v64" ${stroke}/><circle cx="213" cy="354" r="19" fill="${color}"/><circle cx="450" cy="269" r="19" fill="${color}"/><circle cx="687" cy="354" r="19" fill="${color}"/>`,
  };
  return motifs[kind];
}

function containmentMotif(kind, color) {
  const stroke = `stroke="${color}" stroke-width="8" stroke-linecap="square" stroke-linejoin="round" fill="none"`;
  const thin = `stroke="${color}" stroke-width="3" fill="none" opacity=".6"`;
  const motifs = {
    plague: `<path d="M336 412c47-126 181-126 228 0l-31 217H367l-31-217Z" ${stroke}/><path d="M370 450h160l111 56-111 55H370l-111-55 111-56Z" ${stroke}/><circle cx="398" cy="445" r="20" fill="${color}"/><circle cx="502" cy="445" r="20" fill="${color}"/>`,
    void: `<rect x="281" y="328" width="338" height="338" ${stroke}/><rect x="342" y="389" width="216" height="216" fill="#050607"/><path d="M252 298l-51-51M648 298l51-51M252 696l-51 51M648 696l51 51" ${stroke}/><text x="450" y="525" text-anchor="middle" font-size="84" fill="${color}" font-family="monospace">[?]</text>`,
    stairs: `<path d="M270 684h88v-73h88v-73h88v-73h88v-73h88" ${stroke}/><path d="M358 684V341M446 611V341M534 538V341M622 465V341" ${thin}/><path d="M251 341h478" ${stroke}/><circle cx="450" cy="294" r="24" fill="${color}" opacity=".5"/>`,
    'redacted-face': `<path d="M450 274c-116 0-180 91-165 213 16 131 92 225 165 225s149-94 165-225c15-122-49-213-165-213Z" ${stroke}/><rect x="250" y="391" width="400" height="86" fill="#050607"/><path d="M354 583h192M391 641h118" ${thin}/><text x="450" y="450" text-anchor="middle" font-size="36" fill="${color}" font-family="monospace">DATA EXPUNGED</text>`,
    corrosion: `<rect x="266" y="294" width="368" height="420" ${stroke}/><path d="M313 341h274v326H313z" ${thin}/><path d="M334 356c25 56-19 77 4 130 26 60 93 34 85 100-7 57 45 82 98 50 59-35 5-99 47-139 34-32 0-93-55-85-62 8-73-66-179-56Z" fill="${color}" opacity=".45"/><circle cx="548" cy="505" r="15" fill="${color}"/>`,
    concrete: `<path d="M330 695 278 344l172-79 172 79-52 351H330Z" ${stroke}/><path d="M339 391l222 208M561 391 339 599M383 319l44 376M517 319l-44 376" ${thin}/><circle cx="450" cy="488" r="42" ${stroke}/><path d="M250 744h400" ${stroke}/>`,
    reptile: `<path d="M241 568c72-155 270-211 417-105 83 60 61 184-42 205-88 18-183-16-259-59l-116-41Z" ${stroke}/><path d="M616 463l83-77-4 129M308 548l-88-85M362 610l-72 102M554 653l68 75" ${stroke}/><circle cx="592" cy="506" r="14" fill="${color}"/><path d="M353 489l36 32 38-42 41 31 39-43" ${thin}/>`,
    gears: `<circle cx="450" cy="500" r="164" ${stroke}/><circle cx="450" cy="500" r="68" ${stroke}/><path d="M450 277v59M450 664v59M227 500h59M614 500h59M293 343l42 42M565 615l42 42M293 657l42-42M565 385l42-42" ${stroke}/><circle cx="628" cy="342" r="78" ${thin}/><circle cx="272" cy="660" r="61" ${thin}/>`,
    blob: `<path d="M286 585c-34-120 35-246 164-246 135 0 204 127 164 246-29 86-100 116-164 76-64 40-135 10-164-76Z" ${stroke}/><circle cx="388" cy="489" r="18" fill="${color}"/><circle cx="512" cy="489" r="18" fill="${color}"/><path d="M376 570c48 47 100 47 148 0" ${stroke}/><path d="M314 622c-46 60-28 104 17 82M586 622c46 60 28 104-17 82" ${stroke}/>`,
    vault: `<circle cx="450" cy="500" r="216" ${stroke}/><circle cx="450" cy="500" r="148" ${thin}/><circle cx="450" cy="500" r="55" ${stroke}/><path d="M450 284v161M450 555v161M234 500h161M505 500h161M297 347l113 113M490 540l113 113M297 653l113-113M490 460l113-113" ${stroke}/><rect x="411" y="718" width="78" height="42" fill="${color}"/>`,
    symbols: `<text x="450" y="384" text-anchor="middle" font-size="95" fill="${color}" font-family="monospace">●●</text><text x="450" y="505" text-anchor="middle" font-size="95" fill="${color}" font-family="monospace">●●●●●</text><text x="450" y="626" text-anchor="middle" font-size="95" fill="${color}" font-family="monospace">●● ●</text><path d="M245 273h410v440H245z" ${stroke}/><path d="M210 324h480M210 662h480" ${thin}/>`,
    aisle: `<path d="M235 708 328 294h244l93 414M328 294v414M572 294v414M242 532h416M274 412h352" ${stroke}/><path d="M388 294v414M512 294v414" ${thin}/><path d="M405 708h90l-15-117h-60l-15 117Z" fill="${color}" opacity=".65"/><rect x="350" y="330" width="200" height="45" fill="#050607"/><text x="450" y="363" text-anchor="middle" font-size="25" fill="${color}" font-family="monospace">EXIT →</text>`,
  };
  return motifs[kind];
}

function plate(id, label, kind, color, mode) {
  const motif = mode === 'scp' ? containmentMotif(kind, color) : organicMotif(kind, color);
  const accent = mode === 'scp' ? '#b94a45' : '#c3a567';
  const family = mode === 'scp' ? 'CONTAINMENT ARCHIVE' : 'THE MODERN MYTHIC AGE';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" role="img" aria-labelledby="title desc">
<title id="title">${label}</title><desc id="desc">Original abstract editorial plate for Myth Atlas</desc>
<defs><filter id="grain"><feTurbulence baseFrequency=".74" numOctaves="4" seed="${id.length * 17}" type="fractalNoise"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter><radialGradient id="halo"><stop offset="0" stop-color="${color}" stop-opacity=".17"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
<rect width="900" height="1200" fill="#090b0e"/><rect x="36" y="36" width="828" height="1128" rx="2" fill="#101419" stroke="#394049" stroke-width="2"/><rect x="55" y="55" width="790" height="1090" fill="none" stroke="${color}" stroke-opacity=".28"/><rect width="900" height="1200" filter="url(#grain)" opacity=".75"/><circle cx="450" cy="500" r="370" fill="url(#halo)"/>
<g opacity=".22" stroke="${color}" fill="none"><circle cx="450" cy="500" r="300"/><circle cx="450" cy="500" r="248"/><path d="M128 500h644M450 178v644" stroke-dasharray="5 12"/></g>
<g>${motif}</g>
<path d="M92 94h95M713 94h95M92 1106h95M713 1106h95" stroke="${accent}" stroke-width="5"/>
<text x="92" y="139" fill="${accent}" font-size="18" font-family="monospace" letter-spacing="4">ARCANA MUNDI · ${family}</text>
<text x="92" y="1026" fill="${color}" font-size="42" font-family="Georgia,serif" letter-spacing="3">${label}</text>
<text x="92" y="1070" fill="#818992" font-size="15" font-family="monospace" letter-spacing="3">PLATE ${id.toUpperCase()} · MYTH ATLAS EDITORIAL</text>
<text x="808" y="139" text-anchor="end" fill="#818992" font-size="15" font-family="monospace">${mode === 'scp' ? 'CC BY-SA 3.0' : 'CC BY 4.0'}</text>
</svg>`;
}

for (const [id, label, kind, color] of cthulhu) {
  writeFileSync(join(output, `${id}.svg`), plate(id, label, kind, color, 'cthulhu'));
}
for (const [id, label, kind, color] of scp) {
  writeFileSync(join(output, `${id}.svg`), plate(id, label, kind, color, 'scp'));
}

console.log(`${cthulhu.length + scp.length} modern myth plates generated`);
