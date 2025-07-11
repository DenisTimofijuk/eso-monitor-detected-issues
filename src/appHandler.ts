import { Config } from "./config/config";
import { Mapdata } from "./types/Mapdata.type";
import { saveDataToFile, saveLog } from "./utils/logger";
import type ZoneChecker from "./services/ZoneChecker";
import type EmailService from "./services/EmailService";
import { createHTMLMessageUsingTemplate } from "./utils/createHTMLMessageUsingTemplate";

const logger = saveLog();

export async function appHandler(checker: ZoneChecker, notifier: EmailService) {
    try {
        logger.info("Fetching data...");
        const response = await fetch(Config.eso_api_url);
        const data: Mapdata = await response.json();

        if (data.message) {
            logger.info("Message from ESO api:", data.message);
        }

        if (!data.success) {
            logger.error("Something whent wrong while fetching data.");
            return;
        }

        const listOfExistingCoordinates = data.data.map((item) => {
            return { lat: Number(item.lat), lng: Number(item.lng) };
        });

        const results = checker.checkPoints(listOfExistingCoordinates);

        let content = "<ol>";
        for (let item of results) {
            content += `<li>${JSON.stringify(item)}</li>`;
        }
        content += "</ol>";

        if (results.length > 0) {
            logger.info("Found what we are looking for!");

            const messageBody = getMessageBody(content);
            const subject = `ESO monitoring - ${results.length} issues found!`;
            const message = createHTMLMessageUsingTemplate(
                subject,
                messageBody
            );

            await notifier.send(subject, message);
            saveDataToFile(data);
        } else {
            const zones = checker.getZones();

            if (zones.length === 0) {
                logger.info("Nėra nurodytų zonų.");
                return;
            }
            const zoneText =
                zones.length > 1 ? "Nurodytose zonose" : "Nurodytoje zonoje";
            const zoneList = zones.map((item) => item.name).join(', ');

            logger.info(`${zoneText} [${zoneList}] nieko nerasta.`);
        }
    } catch (error: any) {
        logger.error("Error while handling ESO data.", error);
    }
}

function getMessageBody(content: string) {
    return `<p>Nurodytoje zonoje buvo rasta ESO pranešimų apie elektros trikdžius.</p>
            <p>Eiti į https://www.eso.lt/web/atjungimai-planiniai-neplaniniai ir pasitikrinti apie Pikutiškių apylinkėse esančius pranešimus.</p>
            <p>Rastos koordinatės:<br>
            ${content}
            </p>
            <p>Reaguoti reikia greitai, nes pranešimai ESO sistemoje ilgai neužsibūna. Visi momentiniai ESO duomenys išsaugoti Deniso serveryje, tačiau tai tik pranešimų koordinatės, ten nėra gedimo detalių.</p>
            <p>
            Tinkami pranešimai, tie kurie yra ant mūsų elektros linijos. Pasitikrinti galima: 
            <ul>
            <li>https://www.geoportal.lt/map/</i>
            <li>https://regia.lt/map/regia2</li>
            </ul>
            Jeigu pranešimai tinkami, pradėti gedimo akto procedūrą.
            </p>`;
}
