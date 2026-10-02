export const VACATION_PATH = `${import.meta.env.BASE_URL}vacation/`

// Accept both /Noritor/vacation and /Noritor/vacation/
export const isVacationPath = () => window.location.pathname.replace(/\/?$/, '/') === VACATION_PATH

export const getVacationUrl = () => `${window.location.origin}${VACATION_PATH}`
