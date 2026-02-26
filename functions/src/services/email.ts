import { Resend } from "resend";
import * as logger from "firebase-functions/logger";

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_6SJjGz9r_Li9SeBvVWHeLuufYPL88WJWM"
);

const REMETENTE = "onboarding@resend.dev";

const COR_PRIMARIA = "#971A30";
const COR_TEXTO = "#26203B";
const COR_FUNDO_FOOTER = "#f3f4f6";

export type DadosCaronaEmail = {
  passageiroNome: string;
  passageiroEmail: string;
  origem: string;
  destino: string;
  motoristaNome: string;
};

export type DadosEmailMotorista = {
  motoristaNome: string;
  motoristaEmail: string;
  solicitanteNome: string;
  origem: string;
  destino: string;
  dataPartida?: string;
  dataChegada?: string;
};

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/conecta-ufop.firebasestorage.app/o/uploads%2Flogo.png?alt=media&token=b3638a3f-981f-4397-a0f6-cddaee2e7654";

const APP_URL =
  "https://conecta-ufop.web.app/detalhes-carona/5pzFfy5zfRPu0CBGl9rx";

function templateBase(conteudo: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConectaUFOP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 32px; background-color: ${COR_FUNDO_FOOTER};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <img src="${LOGO_URL}" alt="ConectaUFOP" style="width: 67px; height: 32px;">
              <span style="font-size: 24px; font-weight: 700; color: ${COR_TEXTO}; letter-spacing: -0.5px;">ConectaUFOP</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
     <tr>
      <td style="padding: 32px 32px 40px; background-color: #ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        
          <tr>
            <td style="padding: 12px 28px 28px;">
              ${conteudo}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 28px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: ${COR_PRIMARIA};">
                    <a href="${APP_URL}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">Abrir site</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
     <tr>
      <td style="padding: 24px 32px; background-color: ${COR_FUNDO_FOOTER};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <img src="${LOGO_URL}" alt="ConectaUFOP" style="width: 67px; height: 32px;">
            </td>
          </tr>
          <tr>
            <td>
              <span style="font-size: 14px; font-weight: 600; color: ${COR_TEXTO};">ConectaUFOP</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 4px;">
              <span style="font-size: 12px; color: #6b7280;">Facilitando a vida universitária</span>
            </td>
          </tr>
            <tr>
            <td style="padding-top: 4px;">
              <span style="font-size: 12px; color: #6b7280;">Porque tempo é seu maior patrimônio.</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <span style="font-size: 11px; color: #9ca3af;">© ConectaUFOP · Email automático</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function enviarEmailSolicitacaoAceita(
  dados: DadosCaronaEmail
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.passageiroNome)}</strong>!
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      Ótimas notícias: o motorista <strong>${escapeHtml(dados.motoristaNome)}</strong> aceitou sua solicitação de carona.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid ${COR_PRIMARIA};">
      <tr>
        <td style="padding: 16px 20px;">
          <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Rota</span><br>
          <span style="font-size: 15px; font-weight: 600; color: ${COR_TEXTO};">${escapeHtml(dados.origem)} → ${escapeHtml(dados.destino)}</span>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      Entre no site para ver os detalhes da carona e entrar em contato com o motorista.
    </p>
  `;

  resend.emails
    .send({
      from: REMETENTE,
      to: dados.passageiroEmail,
      subject: "ConectaUFOP - Sua solicitação de carona foi aceita!",
      html: templateBase(conteudo),
    })
    .then((response: { data?: unknown }) => {
      logger.info(
        `Email de solicitação aceita enviado para ${dados.passageiroEmail}`,
        response
      );
    })
    .catch((err) => {
      logger.error("Erro ao enviar email de solicitação aceita", err);
    });
}

export async function enviarEmailSolicitacaoRecusada(
  dados: DadosCaronaEmail
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.passageiroNome)}</strong>.
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      Infelizmente a solicitação para a carona de <strong>${escapeHtml(dados.origem)}</strong> até <strong>${escapeHtml(dados.destino)}</strong> não foi aceita pelo motorista.
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      Não desanime! Você pode buscar outras caronas disponíveis no site  — há sempre novas opções de transporte.
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.passageiroEmail,
      subject: "ConectaUFOP - Atualização sobre sua solicitação de carona",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de solicitação recusada enviado para ${dados.passageiroEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de solicitação recusada", err);
  }
}

export async function enviarEmailCaronaIniciada(
  dados: DadosCaronaEmail
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.passageiroNome)}</strong>!
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      O motorista <strong>${escapeHtml(dados.motoristaNome)}</strong> iniciou a carona. Hora de partir!
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid ${COR_PRIMARIA};">
      <tr>
        <td style="padding: 16px 20px;">
          <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Rota</span><br>
          <span style="font-size: 15px; font-weight: 600; color: ${COR_TEXTO};">${escapeHtml(dados.origem)} → ${escapeHtml(dados.destino)}</span>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      Entre em contato com o motorista caso precise de mais informações.
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.passageiroEmail,
      subject: "ConectaUFOP - Sua carona foi iniciada!",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de carona iniciada enviado para ${dados.passageiroEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de carona iniciada", err);
  }
}

export async function enviarEmailCaronaFinalizada(
  dados: DadosCaronaEmail
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.passageiroNome)}</strong>!
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      A carona de <strong>${escapeHtml(dados.origem)}</strong> até <strong>${escapeHtml(dados.destino)}</strong> foi finalizada com sucesso.
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      Motorista: <strong>${escapeHtml(dados.motoristaNome)}</strong>
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      Não se esqueça de avaliar sua experiência no site — sua opinião ajuda outros usuários!
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.passageiroEmail,
      subject: "ConectaUFOP - Carona finalizada!",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de carona finalizada enviado para ${dados.passageiroEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de carona finalizada", err);
  }
}

export async function enviarEmailNovaSolicitacao(
  dados: DadosEmailMotorista
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.motoristaNome)}</strong>!
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      <strong>${escapeHtml(dados.solicitanteNome)}</strong> solicitou uma vaga na sua carona.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid ${COR_PRIMARIA};">
      <tr>
        <td style="padding: 16px 20px;">
          <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Rota</span><br>
          <span style="font-size: 15px; font-weight: 600; color: ${COR_TEXTO};">${escapeHtml(dados.origem)} → ${escapeHtml(dados.destino)}</span>
          ${dados.dataPartida ? `<br><br><span style="font-size: 12px; color: #6b7280;">📅 Partida: ${escapeHtml(dados.dataPartida)}</span>` : ""}
          ${dados.dataChegada ? `<br><span style="font-size: 12px; color: #6b7280;">📅 Chegada prevista: ${escapeHtml(dados.dataChegada)}</span>` : ""}
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      Entre no site para aceitar ou recusar a solicitação.
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.motoristaEmail,
      subject: "ConectaUFOP - Nova solicitação de carona",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de nova solicitação enviado para motorista ${dados.motoristaEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de nova solicitação", err);
  }
}

export async function enviarEmailSolicitacaoCancelada(
  dados: DadosEmailMotorista
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.motoristaNome)}</strong>.
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      <strong>${escapeHtml(dados.solicitanteNome)}</strong> cancelou a solicitação de vaga na sua carona de <strong>${escapeHtml(dados.origem)}</strong> até <strong>${escapeHtml(dados.destino)}</strong>.
      ${dados.dataPartida ? ` (${escapeHtml(dados.dataPartida)})` : ""}
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      A vaga está novamente disponível para outros passageiros.
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.motoristaEmail,
      subject: "ConectaUFOP - Solicitação de carona cancelada",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de solicitação cancelada enviado para motorista ${dados.motoristaEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de solicitação cancelada", err);
  }
}

export async function enviarEmailReservaCancelada(
  dados: DadosEmailMotorista
): Promise<void> {
  const conteudo = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${COR_TEXTO};">
      Olá, <strong>${escapeHtml(dados.motoristaNome)}</strong>.
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${COR_TEXTO};">
      <strong>${escapeHtml(dados.solicitanteNome)}</strong> desistiu da vaga na sua carona de <strong>${escapeHtml(dados.origem)}</strong> até <strong>${escapeHtml(dados.destino)}</strong>.
      ${dados.dataPartida ? ` (${escapeHtml(dados.dataPartida)})` : ""}
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
      A vaga está novamente disponível para outros passageiros.
    </p>
  `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: dados.motoristaEmail,
      subject: "ConectaUFOP - Passageiro desistiu da reserva",
      html: templateBase(conteudo),
    });
    logger.info(
      `Email de reserva cancelada enviado para motorista ${dados.motoristaEmail}`
    );
  } catch (err) {
    logger.error("Erro ao enviar email de reserva cancelada", err);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
