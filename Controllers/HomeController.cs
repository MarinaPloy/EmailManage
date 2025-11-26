using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ManageEmail.Models;
using ManageEmail.Repositories;
using ManageEmail.Filters;

namespace ManageEmail.Controllers
{
    [EtaxAuthorize] // apply to all actions
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }



        public JsonResult GetCustomerList(Filtersearch f)
        {
            f.page = Request.Params["page"];
            f.page_size = Request.Params["rows"];
            f.sort_column = Request.Params["sort"];
            f.order = f.sort_column + " " + Request.Params["order"];
            f.Cnum = int.TryParse(Request.Params["Cnum"], out var cnum) ? cnum : 0;
            f.Snum = int.TryParse(Request.Params["Snum"], out var snum) ? snum : 0;
            var cname = Request.Params["Cname"];
            f.Cname = string.IsNullOrWhiteSpace(cname) ? null : cname;


            List<EtaxBossCustomer> data = AllRepo.GetCustomers(f);

            var jsonData = new
            {
                total = data != null && data.Any() ? data.FirstOrDefault().Total : 0,
                rows = data != null && data.Any() ? data.ToList() : new List<EtaxBossCustomer>(),
            };
            return Json(jsonData, 0);
        }

        public JsonResult GetEmailList(Filtersearch f)
        {
            f.page = Request.Params["page"];
            f.page_size = Request.Params["rows"];
            f.sort_column = Request.Params["sort"];
            f.order = f.sort_column + " " + Request.Params["order"];
            f.Cnum = int.TryParse(Request.Params["Cnum"], out var cnum) ? cnum : 0;
            f.Snum = int.TryParse(Request.Params["Snum"], out var snum) ? snum : 0;
            List<EtaxContactEmail> data = AllRepo.GetEmails(f);

            var jsonData = new
            {
                total = data != null && data.Any() ? data.FirstOrDefault().Total : 0,
                rows = data != null && data.Any() ? data.ToList() : new List<EtaxContactEmail>(),
            };
            return Json(jsonData, 0);
        }

        public ActionResult ModalManage()
        {
            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";
            return View();
        }

        [HttpPost]
        public JsonResult AddEmail(EtaxContactEmail model)
        {
            try
            {
                var cmd = new AllRepo.AddEtaxContactEmail(model); // user resolved in repo
                int rows = cmd.Execute();
                return Json(new { success = rows > 0 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult EditEmail(EtaxContactEmail model)
        {
            try
            {
                var cmd = new AllRepo.EditEtaxContactEmail(model); // user resolved in repo
                int rows = cmd.Execute();
                return Json(new { success = rows > 0 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // DELETE ใช้ WHERE CON_RECID เท่านั้น (ชื่อให้ตรงกับ JS: /Home/DeleteEmailRecord)
        [HttpPost]
        public JsonResult DeleteEmail(int con_recid)
        {
            try
            {
                var cmd = new AllRepo.DeleteEtaxContactEmail(con_recid);
                int rows = cmd.Execute();
                return Json(new { success = rows > 0 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
        [AllowAnonymous]
        public ActionResult NoAccess()
        {
            // This will never be hit for authorized users; route used by EtaxAuthorizeAttribute.
            return View();
        }
    }
}