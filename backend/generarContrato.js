import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';

export const generarContratoPDF = async (datos) => {
  const [year, monthDate, today] = datos.contractSignDate
    .split('-')
    .map(Number);
  const [contractYear, contractMonth, contractDay] = datos.contractStartDate
    .split('-')
    .map(Number);
  const date = new Date(contractYear, contractMonth - 1, contractDay);
  const contractStartDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const month = new Date(`${year}-${monthDate}-${today}`).toLocaleDateString(
    'es-ES',
    {
      month: 'long',
    },
  );
  const duration = {
    'tres años': 3,
    'dos años': 2,
    'un año': 1,
    'seis meses': 6,
  };
  const duracion = duration[datos.duracion];
  const contractEndDateDate =
    duracion === 6
      ? new Date(
          new Date(datos.contractStartDate).setMonth(
            new Date(datos.contractStartDate).getMonth() + 6,
          ),
        )
      : new Date(
          `${contractYear + duracion}-${contractMonth.toString().replace(/^0+/, '')}-${contractDay}`,
        );
  const contractEndDate = contractEndDateDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const adjustment = {
    trimestral: 'trimestre',
    semestral: 'semestre',
    anual: 'año',
  };
  const contractTypeOfAdjustmentMonth = adjustment[datos.adjustmentType];
  const datosUpdates = {
    ...datos,
    todayDate: today,
    month,
    year,
    contractStartDate,
    contractEndDate,
    contractTypeOfAdjustmentMonth,
  };
  const htmlPath = path.resolve('./contractTemplate.html');
  const htmlTemplate = await fs.readFile(htmlPath, 'utf-8');
  const htmlFinal = htmlTemplate.replace(
    /{{(\w+)}}/g,
    (_, key) => datosUpdates[key] || '',
  );

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
  });

  await browser.close();

  const fileName = `contrato_final_${Date.now()}.pdf`;
  const outputPath = path.resolve('./output', fileName);
  await fs.outputFile(outputPath, pdfBuffer);

  return fileName;
};
