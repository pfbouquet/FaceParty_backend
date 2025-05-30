const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

// Import du router à tester
const playersRouter = require("./players");

// Création d'une app Express simulée
const app = express();
app.use(express.json());
app.use("/", playersRouter);

// Mock du modèle Player
jest.mock("../database/models/Players", () => ({
  updateOne: jest.fn(),
}));

const Player = require("../database/models/Players");

describe("PUT /updateName", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner une erreur si playerID ou playerName est manquant", async () => {
    const res = await request(app)
      .put("/updateName")
      .send({ playerID: "123" }); // manque playerName

    expect(res.statusCode).toBe(200); // REST API retourne toujours 200 ici
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Missing playerID or playerName");
  });

  it("devrait retourner un succès si le nom est bien mis à jour", async () => {
    Player.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });

    const res = await request(app)
      .put("/updateName")
      .send({
        playerID: "68384010b233c111cb3b72a6",
        playerName: "replace",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toBe("PlayerName replace changed");
    expect(Player.updateOne).toHaveBeenCalledWith(
      { _id: "68384010b233c111cb3b72a6" },
      { $set: { playerName: "replace" } }
    );
  });

  it("devrait retourner une erreur si aucune modification n'a eu lieu", async () => {
    Player.updateOne.mockResolvedValueOnce({ modifiedCount: 0 });

    const res = await request(app)
      .put("/updateName")
      .send({
        playerID: "68384010b233c111cb3b72a6",
        playerName: "replace",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("PlayerName NOT changed");
  });

  it("devrait retourner une erreur en cas d'exception serveur", async () => {
    Player.updateOne.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .put("/updateName")
      .send({
        playerID: "68384010b233c111cb3b72a6",
        playerName: "replace",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Error updating playerName");
    expect(res.body.error).toBe("DB error");
  });
});
