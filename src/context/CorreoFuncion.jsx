// servicios.js
import { ApiService } from '../services/ApiService';
export const enviarReporteParo = async (datosReporte) => {
 /* const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyvkQ_dCFS277PvRvKFtyRNxW0ngm2z4F37ne5f4qUu81HW5-u2tVpYPbA9hSlXckwN/exec";
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(datosReporte),
      redirect: "follow",
    });
    return await response.json();
  } catch (error) {
    console.error("Error en la API:", error);
    throw error;
  }*/
const enviarCorreo = await ApiService.setCorreo(datosReporte);
return enviarCorreo;
};