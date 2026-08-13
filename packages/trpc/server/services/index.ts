import UserService from "@repo/services/user";
import AuthService from "@repo/services/auth";
import FormService from "@repo/services/form";
import FieldService from "@repo/services/field";
import ResponseService from "@repo/services/response";
import ThemeService from "@repo/services/theme";

export const userService = new UserService();
export const authService = new AuthService();
export const formService = new FormService();
export const fieldService = new FieldService();
export const responseService = new ResponseService();
export const themeService = new ThemeService();
