/**
 * Smoke checks for social media parse/serialize contract.
 * Run: node frontend/nouri/utils/socialMediaLinks.smoke.mjs
 */
import {
  parseSocialMedia,
  serializeSocialMedia,
  socialLinkItems,
} from './socialMediaLinks.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// JSON round-trip
const json = serializeSocialMedia({
  facebook: 'facebook.com/foodmaps',
  instagram: 'https://instagram.com/foodmaps',
  twitter: '',
});
assert(json.includes('facebook'), 'serialize keeps facebook');
assert(json.includes('instagram'), 'serialize keeps instagram');
assert(!json.includes('twitter'), 'serialize omits empty twitter');
const parsed = parseSocialMedia(json);
assert(parsed.facebook.startsWith('https://'), 'normalize facebook');
assert(parsed.instagram.includes('instagram.com'), 'keep instagram');

// Legacy free text
const legacy = parseSocialMedia(
  'Follow us https://facebook.com/school and https://www.instagram.com/school/ thanks',
);
assert(legacy.facebook.includes('facebook.com'), 'legacy facebook');
assert(legacy.instagram.includes('instagram.com'), 'legacy instagram');

// socialLinkItems includes website + socials
const items = socialLinkItems({
  website: 'foodmaps.org',
  social_media: json,
});
assert(items.some((i) => i.network === 'website'), 'website icon');
assert(items.some((i) => i.network === 'facebook'), 'facebook icon');
assert(items.every((i) => i.url.startsWith('http')), 'all urls absolute');

console.log('socialMediaLinks smoke OK');
