const FormData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");

const MORPHER_URL = process.env.MORPHER_URL;
console.log("MORPHER_URL", MORPHER_URL);

// Fonction permettant d'appeler l'API Morpher et de générer 1 mix entre 2 portraits
const getMorph = async (image1_path, image2_path) => {
  // cheking that files exist:
  if (!fs.existsSync(image1_path)) {
    return { result: false, error: "File is missing", file: image1_path };
  }
  if (!fs.existsSync(image2_path)) {
    return { result: false, error: "File is missing", file: image2_path };
  }
  // prepare the form data for CDN Cloudinary
  const form = new FormData();
  form.append("image1", fs.createReadStream(image1_path));
  form.append("image2", fs.createReadStream(image2_path));
  // call morphing service
  const response = await fetch(`${MORPHER_URL}/morph/`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });
  const data = await response.json();
  // handle result
  if (!data || !data.result) {
    console.log(data);
    return { result: false, error: "No data; Problem uncontered", data: data };
  }
  return data;
};

module.exports = { getMorph };
