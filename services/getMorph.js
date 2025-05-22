const FormData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");

const MORPHER_URL = process.env.MORPHER_URL;

const getTestMorph = async () => {
  testMorphData = await getMorph(
    "./test/BradPitt.jpg",
    "./test/DwayneJohnson.jpg"
  );
  return testMorphData;
};

const getMorph = async (image1_path, image2_path) => {
  const form = new FormData();
  form.append("image1", fs.createReadStream(image1_path));
  form.append("image2", fs.createReadStream(image2_path));

  const response = await fetch(`${MORPHER_URL}/morph/`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });
  console.log("ici");
  const data = await response.json();
  console.log("data", data);
  return data;
};

module.exports = { getMorph, getTestMorph };
