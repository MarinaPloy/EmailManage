using System;
using System.Web;
using System.Web.Mvc;
using ManageEmail.Models;
using ManageEmail.Repositories;

namespace ManageEmail.Filters
{
    public class EtaxAuthorizeAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            EtaxUser user;
            return AllRepo.EtaxUserRepo.IsAuthorizedWindowsUser(out user);
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            // For AJAX (JSON) calls return 403; for normal requests redirect
            if (IsAjax(filterContext.HttpContext.Request))
            {
                filterContext.Result = new HttpStatusCodeResult(403, "Unauthorized");
            }
            else
            {
                filterContext.Result = new RedirectResult("~/Home/NoAccess");
            }
        }

        private bool IsAjax(HttpRequestBase request)
        {
            return string.Equals(request.Headers["X-Requested-With"], "XMLHttpRequest", StringComparison.OrdinalIgnoreCase);
        }
    }
}