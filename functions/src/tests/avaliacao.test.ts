process.env.GCLOUD_PROJECT = "conecta-ufop";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

import request from "supertest";
import * as admin from "firebase-admin";
import { api } from "../index";

jest.mock("../middlewares/authenticate", () => ({
  authenticate: () => (req: any, res: any, next: any) => {
    req.user = { uid: "passageiro_teste_352" };
    next();
  },
  optionalAuthenticate: (_req: any, _res: any, next: any) => next(),
}));

const db = admin.firestore();

describe("Testes do Endpoint de Avaliações", () => {
  const motoristaId = "motorista_teste_433";
  const passageiroId = "passageiro_teste_352";
  const caronaId = "carona_teste_541";

  beforeAll(async () => {
    await db.collection("usuarios").doc(motoristaId).set({
      nome: "Motorista de Teste",
      dtAniversario: admin.firestore.Timestamp.fromDate(new Date("1999-03-11")),
      curso_ocupacao: "Ciência da Computação",
    });

    await db.collection("caronas").doc(caronaId).set({
      motoristaId,
      passageiros: [passageiroId],
      status: "FINALIZADA",
    });
  });

  afterAll(async () => {
    await db.collection("usuarios").doc(motoristaId).delete();
    await db.collection("caronas").doc(caronaId).delete();
    const avaliacoesSnap = await db.collection("avaliacoes").where("caronaID", "==", caronaId).get();
    avaliacoesSnap.forEach(async (doc) => await doc.ref.delete());
  });

  describe("POST /avaliacao", () => {
    it("deve retornar 404 se tentar avaliar uma carona que não existe", async () => {
      const payload = {
        caronaID: "id_inventado_que_nao_existe",
        nota: 5,
        comentario: "Muito Bom!",
      };
      const response = await request(api).post("/avaliacao").send(payload);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Carona não encontrada");
    });

    it("deve criar uma avaliação com sucesso", async () => {
      const payload = {
        caronaID: caronaId,
        nota: 5,
        comentario: "Excelente motorista!",
      };

      const response = await request(api).post("/avaliacao").send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.nota).toBe(5);
    });
  });

  describe("GET /avaliacao/:userId", () => {
    it("deve retornar 404 se buscar avaliações de um usuário que não existe", async () => {
      const response = await request(api).get("/avaliacao/usuario_fantasma");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuário não encontrado");
    });

    it("deve retornar as avaliações e a nota média do motorista com sucesso", async () => {
      const response = await request(api).get(`/avaliacao/${motoristaId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("usuario");
      expect(response.body).toHaveProperty("avaliacoes");
      expect(Array.isArray(response.body.avaliacoes)).toBe(true);
    });
  });
});