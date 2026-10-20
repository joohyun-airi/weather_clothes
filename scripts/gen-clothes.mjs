// 시드 인벤토리 생성: node scripts/gen-clothes.mjs → public/data/clothes.json
// 행 형식: [id, 이름, 카테고리, 성별, 연령(2345/A), 최저, 최고, 태그, 톤, 방수, 방풍, 실루엣, 색, 이미지 검색어]
import { writeFileSync } from 'node:fs';

const M = 'male', F = 'female', U = 'unisex';
const HOT = 40, COLD = -25;

const rows = [
  // ── 상의 ────────────────────────────────
  ['top-sleeveless-white', '화이트 민소매 탑', 'top', F, '234', 27, HOT, ['캐주얼', '트렌디'], 'neutral', 0, 0, 'sleeveless', '#f4f2ec', 'white sleeveless top'],
  ['top-sleeveless-gray', '그레이 나시 티셔츠', 'top', M, '23', 27, HOT, ['캐주얼', '스트릿'], 'neutral', 0, 0, 'sleeveless', '#9aa0a6', 'gray tank top men'],
  ['top-linen-sleeveless', '린넨 민소매 블라우스', 'top', F, '45', 27, HOT, ['편안함', '고급 소재'], 'neutral', 0, 0, 'sleeveless', '#e9dfcc', 'linen sleeveless blouse'],
  ['top-tee-oversize-black', '오버핏 반팔 티셔츠', 'top', U, '23', 23, HOT, ['캐주얼', '오버핏', '스트릿'], 'neutral', 0, 0, 'tshirt', '#2a2a2c', 'oversized black t-shirt'],
  ['top-tee-white', '화이트 크루넥 반팔 티', 'top', U, 'A', 23, HOT, ['미니멀', '캐주얼'], 'neutral', 0, 0, 'tshirt', '#fafafa', 'white crew neck t-shirt'],
  ['top-tee-graphic', '그래픽 반팔 티', 'top', U, '2', 23, HOT, ['스트릿', '트렌디'], 'point', 0, 0, 'tshirt', '#e0b23a', 'graphic t-shirt'],
  ['top-tee-stripe', '스트라이프 반팔 티', 'top', U, '234', 22, 32, ['캐주얼', '미니멀'], 'cool', 0, 0, 'tshirt', '#3b5b92', 'striped t-shirt'],
  ['top-tee-crop', '크롭 반팔 티', 'top', F, '2', 25, HOT, ['트렌디', '캐주얼'], 'point', 0, 0, 'tshirt', '#f09a9a', 'cropped t-shirt'],
  ['top-linen-shirt-short', '린넨 반팔 셔츠', 'top', M, '345', 23, HOT, ['세미포멀', '편안함'], 'neutral', 0, 0, 'shirtShort', '#e8e0cf', 'linen short sleeve shirt'],
  ['top-pique-polo', '네이비 피케 폴로 셔츠', 'top', M, '345', 23, HOT, ['클래식', '단정한 핏'], 'cool', 0, 0, 'polo', '#1f2a44', 'navy pique polo shirt'],
  ['top-blouse-short', '쉬폰 반팔 블라우스', 'top', F, '345', 23, 35, ['세미포멀', '단정한 핏'], 'neutral', 0, 0, 'blouse', '#f3e9e4', 'chiffon short sleeve blouse'],
  ['top-linen-blouse', '린넨 반팔 블라우스', 'top', F, '45', 24, HOT, ['편안함', '고급 소재'], 'warm', 0, 0, 'blouse', '#e9dcc6', 'linen blouse'],
  ['top-linen-shirt', '린넨 긴팔 셔츠', 'top', U, '345', 20, 28, ['미니멀', '편안함', '고급 소재'], 'cool', 0, 0, 'shirt', '#dfe7ee', 'linen long sleeve shirt'],
  ['top-oxford-shirt', '화이트 옥스포드 셔츠', 'top', U, 'A', 17, 27, ['세미포멀', '미니멀', '단정한 핏'], 'neutral', 0, 0, 'shirt', '#f7f7f7', 'white oxford shirt'],
  ['top-thin-longsleeve', '얇은 긴팔 티', 'top', U, 'A', 19, 24, ['캐주얼', '미니멀'], 'neutral', 0, 0, 'longsleeve', '#d9d4cc', 'thin long sleeve t-shirt'],
  ['top-waffle-longsleeve', '와플 긴팔 티', 'top', U, '23', 17, 22, ['캐주얼', '트렌디'], 'warm', 0, 0, 'longsleeve', '#cbb79a', 'waffle knit long sleeve'],
  ['top-henley', '헨리넥 긴팔 티', 'top', M, '234', 18, 24, ['캐주얼', '편안함'], 'warm', 0, 0, 'longsleeve', '#8a6e52', 'henley shirt'],
  ['top-blouse-ribbon', '리본 블라우스', 'top', F, '234', 17, 24, ['세미포멀', '트렌디'], 'warm', 0, 0, 'blouse', '#f1d6c8', 'ribbon blouse'],
  ['top-stripe-longsleeve', '스트라이프 긴팔 티', 'top', F, '23', 17, 24, ['캐주얼', '미니멀'], 'cool', 0, 0, 'longsleeve', '#4a6fa5', 'breton stripe top'],
  ['top-silk-blouse', '실크 블라우스', 'top', F, '45', 17, 24, ['고급 소재', '클래식', '단정한 핏'], 'neutral', 0, 0, 'blouse', '#efe6d8', 'silk blouse'],
  ['top-check-shirt', '체크 셔츠', 'top', M, '234', 15, 23, ['캐주얼', '클래식'], 'point', 0, 0, 'shirt', '#a33b3b', 'flannel check shirt'],
  ['top-sweatshirt-gray', '그레이 맨투맨', 'top', U, '23', 12, 19, ['캐주얼', '스트릿', '오버핏'], 'neutral', 0, 0, 'sweatshirt', '#9ea3a8', 'gray sweatshirt'],
  ['top-hoodie-gray', '그레이 후드 맨투맨', 'top', U, '23', 12, 19, ['캐주얼', '스트릿'], 'neutral', 0, 0, 'hoodie', '#8e9399', 'gray hoodie'],
  ['top-sweatshirt-navy', '네이비 맨투맨', 'top', U, '2345', 12, 19, ['캐주얼', '편안함'], 'cool', 0, 0, 'sweatshirt', '#2d3b5c', 'navy sweatshirt'],
  ['top-knit-thin-navy', '네이비 얇은 니트', 'top', M, '345', 14, 21, ['미니멀', '세미포멀', '니트'], 'cool', 0, 0, 'knit', '#26334f', 'navy fine knit sweater'],
  ['top-knit-vneck-ivory', '아이보리 브이넥 니트', 'top', F, '345', 12, 20, ['단정한 핏', '니트', '클래식'], 'neutral', 0, 0, 'knit', '#f0ead9', 'ivory v-neck sweater'],
  ['top-knit-crew-beige', '베이지 크루넥 니트', 'top', U, '234', 9, 19, ['미니멀', '니트'], 'warm', 0, 0, 'knit', '#d7c3a3', 'beige crew neck knit sweater'],
  ['top-turtleneck-black', '블랙 터틀넥 니트', 'top', U, '2345', 3, 14, ['미니멀', '세미포멀', '니트'], 'neutral', 0, 0, 'turtleneck', '#1d1d1f', 'black turtleneck'],
  ['top-cable-knit', '두꺼운 케이블 니트', 'top', U, 'A', 0, 11, ['클래식', '니트', '편안함'], 'warm', 0, 0, 'knit', '#c9ae86', 'chunky cable knit sweater'],
  ['top-flannel-lined', '기모 체크 셔츠', 'top', M, '2345', -5, 12, ['캐주얼', '클래식'], 'point', 0, 0, 'shirt', '#7a2e2e', 'fleece lined flannel shirt'],
  ['top-fleece-sweatshirt', '기모 맨투맨', 'top', U, '23', COLD, 8, ['캐주얼', '편안함'], 'neutral', 0, 0, 'sweatshirt', '#6b6f75', 'fleece lined sweatshirt'],
  ['top-fleece-hoodie', '기모 후드티', 'top', U, '2', COLD, 8, ['스트릿', '오버핏'], 'warm', 0, 0, 'hoodie', '#5f6b4e', 'fleece hoodie khaki'],
  ['top-cashmere-knit', '캐시미어 니트', 'top', U, '345', COLD, 10, ['고급 소재', '클래식', '니트'], 'warm', 0, 0, 'knit', '#b49a7a', 'cashmere sweater'],
  ['top-wool-turtleneck', '크림 울 터틀넥', 'top', F, '2345', COLD, 10, ['미니멀', '니트', '고급 소재'], 'neutral', 0, 0, 'turtleneck', '#efe7d6', 'cream wool turtleneck'],

  // ── 하의 ────────────────────────────────
  ['bottom-shorts-cotton', '면 반바지', 'bottom', M, '234', 25, HOT, ['캐주얼', '편안함'], 'neutral', 0, 0, 'shorts', '#c8b89a', 'cotton shorts men'],
  ['bottom-shorts-slacks', '슬랙스 반바지', 'bottom', M, '345', 25, HOT, ['미니멀', '세미포멀'], 'neutral', 0, 0, 'shorts', '#5a5a5e', 'tailored shorts'],
  ['bottom-shorts-denim', '데님 반바지', 'bottom', F, '23', 25, HOT, ['캐주얼', '트렌디'], 'cool', 0, 0, 'shorts', '#7da0c8', 'denim shorts women'],
  ['bottom-skirt-tennis', '테니스 스커트', 'bottom', F, '2', 23, 35, ['트렌디', '캐주얼'], 'point', 0, 0, 'skirt', '#f2f2f2', 'pleated tennis skirt'],
  ['bottom-linen-pants', '린넨 와이드 팬츠', 'bottom', U, '345', 23, HOT, ['편안함', '고급 소재', '미니멀'], 'neutral', 0, 0, 'pants', '#e4dccb', 'linen wide pants'],
  ['bottom-skirt-linen', '린넨 롱스커트', 'bottom', F, '345', 23, HOT, ['편안함', '미니멀'], 'neutral', 0, 0, 'skirt', '#efe8da', 'linen maxi skirt'],
  ['bottom-chino', '베이지 면바지', 'bottom', U, 'A', 15, 30, ['세미포멀', '단정한 핏', '클래식'], 'warm', 0, 0, 'pants', '#cdb48c', 'beige chino pants'],
  ['bottom-skirt-pleats', '플리츠 미디스커트', 'bottom', F, '2345', 15, 30, ['트렌디', '세미포멀'], 'neutral', 0, 0, 'skirt', '#b9b2a8', 'pleated midi skirt'],
  ['bottom-banding-wide', '밴딩 와이드 팬츠', 'bottom', U, '45', 9, 26, ['편안함'], 'neutral', 0, 0, 'pants', '#6e6a63', 'elastic waist wide pants'],
  ['bottom-slacks-wide', '와이드 슬랙스', 'bottom', F, '34', 9, 25, ['세미포멀', '미니멀'], 'neutral', 0, 0, 'pants', '#3a3a3c', 'wide leg slacks women'],
  ['bottom-slacks-black', '블랙 슬랙스', 'bottom', M, '345', 5, 25, ['세미포멀', '단정한 핏', '미니멀'], 'neutral', 0, 0, 'pants', '#232325', 'black slacks men'],
  ['bottom-cargo', '카고 팬츠', 'bottom', U, '2', 9, 24, ['스트릿', '오버핏'], 'warm', 0, 0, 'pants', '#6b6a4c', 'cargo pants'],
  ['bottom-wide-jeans', '와이드 데님', 'bottom', F, '23', 5, 24, ['트렌디', '오버핏', '스트릿'], 'cool', 0, 0, 'jeans', '#6d8fbf', 'wide leg jeans'],
  ['bottom-jeans-light', '연청 스트레이트 청바지', 'bottom', U, 'A', 5, 22, ['캐주얼'], 'cool', 0, 0, 'jeans', '#8fb1d6', 'light wash straight jeans'],
  ['bottom-jogger', '조거 팬츠', 'bottom', U, '23', 5, 22, ['캐주얼', '편안함', '스트릿'], 'neutral', 0, 0, 'pants', '#4b4f55', 'jogger pants'],
  ['bottom-jeans-dark', '생지 데님', 'bottom', U, '2345', 0, 20, ['미니멀', '캐주얼', '단정한 핏'], 'cool', 0, 0, 'jeans', '#2e3f63', 'raw denim jeans'],
  ['bottom-skirt-wool-check', '울 체크 스커트', 'bottom', F, '23', 0, 14, ['클래식', '트렌디'], 'point', 0, 0, 'skirt', '#7b4b3a', 'wool check skirt'],
  ['bottom-corduroy', '코듀로이 팬츠', 'bottom', U, '2345', -5, 14, ['클래식', '캐주얼'], 'warm', 0, 0, 'pants', '#8b5e3c', 'corduroy pants'],
  ['bottom-wool-slacks', '울 슬랙스', 'bottom', U, '345', -10, 12, ['클래식', '고급 소재', '단정한 핏'], 'neutral', 0, 0, 'pants', '#4a4a4f', 'wool trousers'],
  ['bottom-wool-skirt-long', '울 롱스커트 + 기모 스타킹', 'bottom', F, '345', -10, 12, ['클래식', '고급 소재'], 'neutral', 0, 0, 'skirt', '#3b3b40', 'wool long skirt tights'],
  ['bottom-fleece-jeans', '기모 청바지', 'bottom', U, 'A', COLD, 8, ['캐주얼', '편안함'], 'cool', 0, 0, 'jeans', '#3d5277', 'fleece lined jeans'],
  ['bottom-fleece-jogger', '기모 조거 팬츠', 'bottom', U, '23', COLD, 6, ['스트릿', '편안함'], 'neutral', 0, 0, 'pants', '#3c3f44', 'fleece jogger pants'],

  // ── 원피스 ──────────────────────────────
  ['dress-floral-linen', '플로럴 린넨 원피스', 'dress', F, '234', 25, HOT, ['트렌디'], 'point', 0, 0, 'dress', '#e7a7a0', 'floral linen dress'],
  ['dress-sleeveless-black', '블랙 민소매 원피스', 'dress', F, '2345', 25, HOT, ['미니멀', '세미포멀'], 'neutral', 0, 0, 'dress', '#262628', 'black sleeveless dress'],
  ['dress-tiered', '티어드 롱 원피스', 'dress', F, '2', 20, 30, ['트렌디', '캐주얼'], 'warm', 0, 0, 'dress', '#e9d3b3', 'tiered maxi dress'],
  ['dress-shirt', '셔츠 원피스', 'dress', F, '345', 18, 27, ['세미포멀', '단정한 핏', '미니멀'], 'cool', 0, 0, 'dress', '#a9bcd0', 'shirt dress'],
  ['dress-knit', '니트 원피스', 'dress', F, '2345', 5, 16, ['니트', '미니멀', '클래식'], 'warm', 0, 0, 'dress', '#a88c6d', 'knit dress'],
  ['dress-wool', '울 롱 원피스', 'dress', F, '45', -5, 10, ['클래식', '고급 소재', '단정한 핏'], 'neutral', 0, 0, 'dress', '#3f3a3a', 'wool midi dress'],

  // ── 아우터 ──────────────────────────────
  ['outer-cardigan-thin', '얇은 린넨 가디건', 'outer', U, '2345', 20, 26, ['미니멀', '편안함'], 'neutral', 0, 0, 'cardigan', '#ece4d4', 'thin linen cardigan'],
  ['outer-rain-jacket', '방수 레인 재킷', 'outer', U, 'A', 10, 25, ['캐주얼', '레인웨어'], 'point', 1, 1, 'windbreaker', '#e3b23c', 'yellow rain jacket'],
  ['outer-overshirt', '셔츠 재킷', 'outer', U, '23', 17, 23, ['캐주얼', '스트릿', '오버핏'], 'warm', 0, 0, 'shirt', '#7a6a52', 'overshirt shacket'],
  ['outer-cardigan-navy', '네이비 카디건', 'outer', F, '345', 15, 22, ['클래식'], 'cool', 0, 0, 'cardigan', '#2a3654', 'navy cardigan women'],
  ['outer-cardigan-gray', '그레이 니트 가디건', 'outer', M, '2345', 15, 22, ['미니멀', '니트', '클래식'], 'neutral', 0, 0, 'cardigan', '#8d9196', 'gray cardigan men'],
  ['outer-cardigan-cream', '크림 니트 가디건', 'outer', F, '23', 15, 22, ['트렌디', '니트', '캐주얼'], 'warm', 0, 0, 'cardigan', '#f1e6d0', 'cream knit cardigan'],
  ['outer-denim-jacket', '데님 재킷', 'outer', U, '23', 14, 22, ['캐주얼', '스트릿'], 'cool', 0, 0, 'jacket', '#5f84b4', 'denim jacket'],
  ['outer-blazer-navy', '네이비 블레이저', 'outer', M, '345', 12, 22, ['세미포멀', '클래식', '단정한 핏'], 'cool', 0, 0, 'jacket', '#232f4b', 'navy blazer men'],
  ['outer-blazer-beige', '베이지 테일러드 재킷', 'outer', F, '2345', 12, 22, ['세미포멀', '미니멀', '단정한 핏'], 'warm', 0, 0, 'jacket', '#d4bf9e', 'beige tailored blazer women'],
  ['outer-anorak', '아노락', 'outer', U, '2', 13, 20, ['스트릿', '트렌디'], 'point', 1, 1, 'windbreaker', '#3a6b4c', 'anorak jacket'],
  ['outer-windbreaker', '나일론 바람막이', 'outer', U, '23', 12, 19, ['스트릿'], 'cool', 1, 1, 'windbreaker', '#3e6e8e', 'nylon windbreaker'],
  ['outer-field-jacket', '야상 필드 재킷', 'outer', U, '2345', 9, 16, ['캐주얼', '클래식'], 'warm', 0, 1, 'jacket', '#5e6447', 'field jacket'],
  ['outer-trench-beige', '베이지 트렌치코트', 'outer', U, '345', 9, 16, ['클래식'], 'warm', 1, 1, 'trench', '#c8ad84', 'beige trench coat'],
  ['outer-fleece', '플리스 재킷', 'outer', U, '2345', 5, 13, ['캐주얼', '편안함'], 'neutral', 0, 1, 'jacket', '#e8e3d8', 'fleece jacket'],
  ['outer-wool-blouson', '울 블루종', 'outer', M, '345', 5, 14, ['클래식', '단정한 핏'], 'neutral', 0, 1, 'jacket', '#3e3a36', 'wool blouson jacket'],
  ['outer-leather-jacket', '블랙 가죽 재킷', 'outer', U, '234', 5, 12, ['스트릿', '트렌디'], 'neutral', 0, 1, 'jacket', '#1c1c1c', 'black leather jacket'],
  ['outer-quilted', '퀼팅 경량 패딩', 'outer', U, '345', 3, 12, ['클래식', '편안함'], 'warm', 0, 1, 'padding', '#3c4636', 'quilted light down jacket'],
  ['outer-wool-coat-camel', '카멜 울 코트', 'outer', F, '2345', 3, 10, ['클래식', '고급 소재'], 'warm', 0, 1, 'coat', '#b8895a', 'camel wool coat women'],
  ['outer-wool-coat-charcoal', '차콜 싱글 울 코트', 'outer', M, '23', 2, 10, ['미니멀', '세미포멀'], 'neutral', 0, 1, 'coat', '#46484c', 'charcoal wool coat men'],
  ['outer-cashmere-coat', '캐시미어 울 코트', 'outer', M, '45', 0, 8, ['클래식', '고급 소재'], 'neutral', 0, 1, 'coat', '#3a3a3d', 'cashmere overcoat men'],
  ['outer-duffle', '더플코트', 'outer', U, '2', -5, 6, ['캐주얼', '트렌디'], 'warm', 0, 1, 'coat', '#8a6b4a', 'duffle coat'],
  ['outer-heavy-coat', '핸드메이드 롱코트', 'outer', U, '345', -10, 5, ['고급 소재', '클래식', '단정한 핏'], 'neutral', 0, 1, 'coat', '#5b5650', 'long wool coat'],
  ['outer-mustang', '무스탕', 'outer', F, '234', -10, 4, ['트렌디', '고급 소재'], 'warm', 0, 1, 'coat', '#6e4a32', 'shearling jacket women'],
  ['outer-short-padding', '숏 패딩', 'outer', U, '23', -15, 4, ['스트릿'], 'neutral', 1, 1, 'padding', '#222224', 'short puffer jacket'],
  ['outer-long-padding', '롱 구스다운 패딩', 'outer', U, 'A', COLD, 2, ['편안함'], 'neutral', 1, 1, 'paddingLong', '#2b2b2e', 'long goose down parka'],
  ['outer-hooded-long-padding', '아이보리 후드 롱패딩', 'outer', F, '2345', COLD, 0, ['편안함', '트렌디'], 'neutral', 1, 1, 'paddingLong', '#e9e6df', 'ivory long puffer coat'],
  ['outer-down-parka', '헤비 다운 파카', 'outer', M, '345', COLD, -5, ['클래식', '고급 소재'], 'warm', 1, 1, 'padding', '#34413a', 'heavy down parka men'],

  // ── 신발 ────────────────────────────────
  ['shoes-sport-sandal', '스포츠 샌들', 'shoes', U, '23', 25, HOT, ['캐주얼', '스트릿'], 'neutral', 1, 0, 'sandals', '#333336', 'sport sandals'],
  ['shoes-leather-sandal', '레더 샌들', 'shoes', M, '345', 25, HOT, ['클래식', '편안함'], 'warm', 0, 0, 'sandals', '#7a5232', 'leather sandals men'],
  ['shoes-strap-sandal', '스트랩 샌들', 'shoes', F, '2345', 25, HOT, ['트렌디', '미니멀'], 'warm', 0, 0, 'sandals', '#c9a27a', 'strappy sandals women'],
  ['shoes-slip-on', '캔버스 슬립온', 'shoes', U, '2345', 20, HOT, ['편안함', '미니멀'], 'neutral', 0, 0, 'sneakers', '#d8d3c8', 'canvas slip-on'],
  ['shoes-white-sneakers', '화이트 스니커즈', 'shoes', U, '234', 5, 30, ['캐주얼', '미니멀'], 'neutral', 0, 0, 'sneakers', '#f5f5f5', 'white sneakers'],
  ['shoes-canvas', '레드 캔버스 스니커즈', 'shoes', U, '2', 15, 30, ['캐주얼', '트렌디'], 'point', 0, 0, 'sneakers', '#c94040', 'red canvas sneakers'],
  ['shoes-running', '러닝화', 'shoes', U, 'A', 0, 30, ['편안함', '캐주얼'], 'cool', 0, 0, 'sneakers', '#8696a8', 'running shoes'],
  ['shoes-mule', '블로퍼', 'shoes', F, '345', 17, 30, ['미니멀', '편안함'], 'neutral', 0, 0, 'loafers', '#e8e0d0', 'mule loafers women'],
  ['shoes-flat', '플랫슈즈', 'shoes', F, '2345', 15, 28, ['단정한 핏', '클래식'], 'neutral', 0, 0, 'flats', '#2b2b2b', 'ballet flats'],
  ['shoes-maryjane', '메리제인 슈즈', 'shoes', F, '23', 12, 26, ['트렌디', '세미포멀'], 'neutral', 0, 0, 'flats', '#3a2a24', 'mary jane shoes'],
  ['shoes-loafer', '가죽 로퍼', 'shoes', M, '345', 9, 25, ['클래식', '세미포멀'], 'warm', 0, 0, 'loafers', '#5a3a22', 'leather loafers men'],
  ['shoes-loafer-black', '블랙 로퍼', 'shoes', F, '2345', 9, 25, ['클래식', '단정한 핏', '세미포멀'], 'neutral', 0, 0, 'loafers', '#1e1e1e', 'black loafers women'],
  ['shoes-derby', '더비 슈즈', 'shoes', M, '345', -5, 22, ['세미포멀', '클래식', '고급 소재'], 'neutral', 0, 0, 'loafers', '#1f1a17', 'derby shoes'],
  ['shoes-rain-boots', '레인부츠', 'shoes', U, 'A', 0, 25, ['레인웨어'], 'neutral', 1, 0, 'boots', '#3b3b3b', 'rain boots'],
  ['shoes-chelsea', '첼시 부츠', 'shoes', U, '2345', -5, 14, ['클래식', '미니멀'], 'neutral', 1, 0, 'boots', '#2a2420', 'chelsea boots'],
  ['shoes-ankle-boots', '앵클 부츠', 'shoes', F, '2345', 0, 14, ['트렌디', '세미포멀'], 'neutral', 0, 0, 'boots', '#3d3330', 'ankle boots women'],
  ['shoes-walker', '워커 부츠', 'shoes', U, '23', COLD, 10, ['스트릿'], 'warm', 1, 0, 'boots', '#6b4a2e', 'combat boots'],
  ['shoes-winter-sneakers', '방한 운동화', 'shoes', U, 'A', COLD, 5, ['편안함'], 'neutral', 1, 0, 'sneakers', '#4a4d52', 'winter insulated sneakers'],
  ['shoes-fur-boots', '양털 부츠', 'shoes', F, '234', COLD, 4, ['편안함', '트렌디'], 'warm', 0, 0, 'boots', '#c49a6c', 'sheepskin boots'],

  // ── 액세서리 ────────────────────────────
  ['acc-umbrella-long', '장우산', 'acc', U, 'A', COLD, HOT, ['클래식'], 'neutral', 1, 0, 'umbrella', '#2c3e50', 'long umbrella'],
  ['acc-umbrella-compact', '3단 우산', 'acc', U, 'A', COLD, HOT, ['미니멀'], 'cool', 1, 0, 'umbrella', '#6c8fb3', 'compact umbrella'],
  ['acc-sunglasses', '선글라스', 'acc', U, 'A', 20, HOT, ['트렌디', '캐주얼'], 'neutral', 0, 0, 'sunglasses', '#222222', 'sunglasses'],
  ['acc-cap', '볼캡', 'acc', U, '234', 18, HOT, ['캐주얼', '스트릿'], 'neutral', 0, 0, 'cap', '#2d2d2d', 'baseball cap'],
  ['acc-bucket-hat', '버킷햇', 'acc', U, '2', 18, HOT, ['스트릿', '트렌디'], 'warm', 0, 0, 'bucket', '#c2b08a', 'bucket hat'],
  ['acc-sunhat', '라탄 밀짚모자', 'acc', F, '2345', 23, HOT, ['편안함', '트렌디'], 'warm', 0, 0, 'sunhat', '#d8c08f', 'straw sun hat'],
  ['acc-wool-muffler', '울 머플러', 'acc', U, 'A', COLD, 6, ['클래식'], 'neutral', 0, 1, 'scarf', '#8a7f72', 'wool muffler'],
  ['acc-check-muffler', '체크 머플러', 'acc', U, '23', COLD, 8, ['트렌디', '캐주얼'], 'point', 0, 1, 'scarf', '#a94442', 'check scarf'],
  ['acc-cashmere-muffler', '캐시미어 머플러', 'acc', U, '45', COLD, 8, ['고급 소재', '클래식'], 'warm', 0, 1, 'scarf', '#c3a07a', 'cashmere scarf'],
  ['acc-beanie', '니트 비니', 'acc', U, '23', COLD, 8, ['스트릿', '캐주얼'], 'neutral', 0, 1, 'beanie', '#444448', 'knit beanie'],
  ['acc-gloves', '가죽 장갑', 'acc', U, '345', COLD, 5, ['고급 소재', '클래식'], 'neutral', 0, 1, 'gloves', '#3a2a20', 'leather gloves'],
];

const AGE = { 2: '20s', 3: '30s', 4: '40s', 5: '50s' };
const items = rows.map(([id, name, category, gender, ages, minTemp, maxTemp, styleTags, colorTone, wp, wdp, shape, color, imageQuery]) => ({
  id, name, category, gender,
  ages: ages === 'A' ? ['20s', '30s', '40s', '50s'] : [...ages].map((d) => AGE[d]),
  minTemp, maxTemp, styleTags, colorTone,
  waterproof: !!wp, windproof: !!wdp,
  shape, color, imageQuery,
  imageUrl: null,
  credit: null,
}));

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) throw new Error(`중복 id: ${it.id}`);
  ids.add(it.id);
  if (it.minTemp > it.maxTemp) throw new Error(`온도 범위 오류: ${it.id}`);
}

writeFileSync(new URL('../public/data/clothes.json', import.meta.url), JSON.stringify(items, null, 2) + '\n');
const byCat = items.reduce((m, it) => ((m[it.category] = (m[it.category] ?? 0) + 1), m), {});
console.log(`clothes.json: ${items.length}개`, byCat);
