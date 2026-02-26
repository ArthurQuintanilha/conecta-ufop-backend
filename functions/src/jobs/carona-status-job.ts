import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

const DUAS_HORAS_MS = 2 * 60 * 60 * 1000;

export const atualizarStatusCaronas = onSchedule(
  {
    schedule: "every 2 hours",
    timeZone: "America/Sao_Paulo",
    region: "southamerica-east1",
  },
  async () => {
    const db = admin.firestore();
    const agora = new Date();
    const cutoffFim = new Date(agora.getTime() - DUAS_HORAS_MS);
    const cutoffInicio = new Date(agora.getTime() - DUAS_HORAS_MS);
    const cutoffFimTs = admin.firestore.Timestamp.fromDate(cutoffFim);
    const cutoffInicioTs = admin.firestore.Timestamp.fromDate(cutoffInicio);

    let finalizadas = 0;
    let canceladas = 0;

    try {
      const iniciadasSnap = await db
        .collection("caronas")
        .where("status", "==", "INICIADA")
        .where("dtChegada", "<=", cutoffFimTs)
        .get();

      const batchFinalizar = db.batch();
      iniciadasSnap.docs.forEach((doc) => {
        batchFinalizar.update(doc.ref, { status: "FINALIZADA", solicitacoes: [] });
        finalizadas++;
      });
      if (finalizadas > 0) {
        await batchFinalizar.commit();
      }

      const abertasSnap = await db
        .collection("caronas")
        .where("status", "==", "ABERTA")
        .where("dtPartida", "<=", cutoffInicioTs)
        .get();

      const batchCancelar = db.batch();
      abertasSnap.docs.forEach((doc) => {
        batchCancelar.update(doc.ref, { status: "CANCELADO", solicitacoes: [] });
        canceladas++;
      });
      if (canceladas > 0) {
        await batchCancelar.commit();
      }

      if (finalizadas > 0 || canceladas > 0) {
        logger.info(
          `Job carona-status: ${finalizadas} caronas finalizadas, ${canceladas} canceladas`
        );
      }
    } catch (err) {
      logger.error("Erro no job de atualização de status de caronas", err);
      throw err;
    }
  }
);
