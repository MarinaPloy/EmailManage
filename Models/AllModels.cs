using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ManageEmail.Models
{
    public class Filtersearch
    {
        public string page { get; set; }
        public string page_size { get; set; }
        public string sort_column { get; set; }
        public string order { get; set; }
        public int Cnum { get; set; }
        public int Snum { get; set; }
        public string Cname { get; set; }
    }
    public class SearchCustomer
    {
        public int Cnum { get; set; }
        public int Snum { get; set; }

    }
    public class EtaxUser
    {
        public string UserName { get; set; }
        public string Role { get; set; }
        public string Status { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class EtaxContactEmail
    {
        public int CON_RECID { get; set; }
        public int cust_number { get; set; }
        public int site_number { get; set; }
        public string email_taxinv { get; set; }
        public string created_by { get; set; }
        public string created_date { get; set; }
        public string changed_by { get; set; }
        public string changed_date { get; set; }

        public int Total { get; set; }
        public int ROW_NUM { get; set; }
        public int PageNum { get; set; }
        public int PageSize { get; set; }
    }
    public class EtaxBossCustomer
    {
        public int customer_number { get; set; }
        public int site_number { get; set; }
        public string customer_name { get; set; }
        public string address1 { get; set; }
        public string address2 { get; set; }
        public string address3 { get; set; }
        public string address4 { get; set; }
        public string city { get; set; }
        public string postal_code { get; set; }
        public string COMPANY { get; set; }

        public int Total { get; set; }
        public int ROW_NUM { get; set; }
        public int PageNum { get; set; }
        public int PageSize { get; set; }
    }
}