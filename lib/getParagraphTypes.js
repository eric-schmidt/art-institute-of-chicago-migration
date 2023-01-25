import fetch from 'node-fetch';

export async function getParagraphTypes(url) {
  // 'url' should be the JSON API url, with all nested reference fields included.
  // e.g. https://stage.cliniciansbrief.com/jsonapi/node/custom?include=field_body_area,field_body_area.field_body_content,field_body_area.field_full_width_body,field_body_area.field_body
  let data = await fetch(url);
  data = await data.json();

  const types = [];
  data.included.map((item) => {
    types.push(item.type);
  });

  // Remove duplicates.
  return types.filter((item, index) => types.indexOf(item) === index);
}
