// fonction permettant de s'assurer qu'un champs est correctement remplit
function checkBody(body, keys) {
  let isValid = true;

  for (const field of keys) {
    if (!(body[field] === false) && (!body[field] || body[field] === "")) {
      isValid = false;
    }
  }

  return isValid;
}

module.exports = { checkBody };
