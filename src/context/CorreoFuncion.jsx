// servicios.js
export const enviarReporteParo = async (datosReporte) => {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby5-bU7NMQP9i1FZ3MU8cFb_VEynE-J4J9-JNwzpAuDvxbvKZcfbawmzM4_8lPH7Lpu/exec";
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
  }
};