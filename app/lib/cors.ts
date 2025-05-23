// lib/cors.ts
import Cors from "cors";
import initMiddleware from "@/app/lib/init-middleware";

// Initialize the cors middleware
export const cors = initMiddleware(
  Cors({
    origin: "*", // Or set specific domains
    methods: ["POST", "GET", "HEAD"],
  })
);
