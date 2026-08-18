import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'images');
mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} ${url}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          writeFileSync(dest, Buffer.concat(chunks));
          resolve(dest);
        });
      }
    );
    req.on('error', reject);
  });
}

const files = [
  {
    localFile: 'hero-lighthouse.png',
    src: null,
    copyFrom: join(__dirname, '../../themes/suffolk-county/screenshot-hero.png'),
    alt: 'Montauk Point Lighthouse',
    sectionPosition: 3,
    field: 'Image',
  },
  {
    localFile: 'logo-seal.png',
    src: null,
    copyFrom: join(__dirname, '../../themes/suffolk-county/images/logo.png'),
    alt: 'Suffolk County Government seal',
    sectionPosition: 9,
    field: 'Image1',
  },
  {
    localFile: 'slide-emergency.jpg',
    src: 'https://suffolkcountyny.gov/Portals/0/EasyDNNRotator/2903/nt1debnw.jpg',
    alt: 'Emergency Preparedness Tips for Families',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'slide-bullying.jpg',
    src: 'https://suffolkcountyny.gov/Portals/0/EasyDNNRotator/2903/prrlkgrs.jpg',
    alt: 'Suffolk Stop Bullying',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'slide-police-reform.jpg',
    src: 'https://suffolkcountyny.gov/portals/0/images/police%20reform/play%20ball.jpg',
    alt: 'Suffolk County Police Reform and Reinvention Task Force',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'slide-hazard.jpg',
    src: 'https://suffolkcountyny.gov/Portals/0/EasyDNNRotator/2903/rlrkyvka.jpg',
    alt: 'Hazard Mitigation and coastal resiliency',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'slide-alert.png',
    src: 'https://suffolkcountyny.gov/Portals/0/EasyDNNRotator/2903/t4aavcru.png',
    alt: 'SuffolkAlert Emergency Notification System',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'slide-smart-start.jpg',
    src: 'https://suffolkcountyny.gov/Portals/0/EasyDNNRotator/2903/mjyyw0jt.jpg',
    alt: 'Suffolk Smart Start',
    sectionPosition: 5,
    field: 'Image',
  },
  {
    localFile: 'featured-sst.jpg',
    src: 'https://suffolkcountyny.gov/portals/0/images/home/services/sst.jpg',
    alt: 'Submission and Status Portal',
    sectionPosition: 8,
    field: 'Image1',
  },
  {
    localFile: 'featured-fire.jpg',
    src: 'https://suffolkcountyny.gov/portals/0/images/home/services/fire_ems.jpg',
    alt: 'Volunteer Firefighter or EMS',
    sectionPosition: 8,
    field: 'Image2',
  },
  {
    localFile: 'featured-opendata.jpg',
    src: 'https://suffolkcountyny.gov/portals/0/images/home/services/opendata.jpg',
    alt: 'Suffolk County Open Data',
    sectionPosition: 8,
    field: 'Image3',
  },
  {
    localFile: 'featured-alert.png',
    src: 'https://suffolkcountyny.gov/portals/0/images/home/services/SC%20Emergency%20Alerts.png',
    alt: 'SuffolkAlert',
    sectionPosition: 8,
    field: 'Image4',
  },
  {
    localFile: 'featured-cops.jpg',
    src: 'https://suffolkcountyny.gov/portals/0/images/home/services/852cops.jpg',
    alt: '852-COPS Non-Emergency',
    sectionPosition: 8,
    field: 'Image5',
  },
];

const manifest = [];
for (const file of files) {
  const dest = join(outDir, file.localFile);
  try {
    if (file.copyFrom && existsSync(file.copyFrom)) {
      copyFileSync(file.copyFrom, dest);
      console.log('copied', file.localFile);
    } else if (file.src) {
      await download(file.src, dest);
      console.log('downloaded', file.localFile);
    } else {
      throw new Error('missing source');
    }
    manifest.push({
      localFile: file.localFile,
      src: file.src || file.copyFrom,
      alt: file.alt,
      sectionPosition: file.sectionPosition,
      field: file.field,
      status: 'downloaded',
    });
  } catch (err) {
    console.error('FAILED', file.localFile, err.message);
    manifest.push({
      localFile: file.localFile,
      src: file.src,
      alt: file.alt,
      sectionPosition: file.sectionPosition,
      field: file.field,
      status: 'failed',
      error: err.message,
    });
  }
}

writeFileSync(join(outDir, 'image-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote image-manifest.json', manifest.filter((m) => m.status === 'downloaded').length);
