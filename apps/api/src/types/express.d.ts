import { BoardRole } from "@taskflow/types";
import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
      board?: {
        id: string;
        role: BoardRole;
        owner_id: string;
      };
    }
  }
}
