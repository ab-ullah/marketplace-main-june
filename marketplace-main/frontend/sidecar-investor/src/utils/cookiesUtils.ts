const setCookie = (name: string, value: string, hours=1): void => {
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string): string | undefined => {
    return document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const deleteCookie = (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  };
  
  export {setCookie,getCookie, deleteCookie }