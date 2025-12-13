import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#112233",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#cccccc",
  },
  instituteName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#112233",
    textAlign: "right",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
    textDecoration: "underline",
  },
  metadataSection: {
    marginBottom: 20,
    fontSize: 10,
  },
  recipientSection: {
    marginBottom: 20,
    fontSize: 11,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "justify",
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 15,
    marginVertical: 15,
    backgroundColor: "#f9f9f9",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "bold",
    width: 120,
  },
  detailValue: {
    fontSize: 11,
  },
  signatureSection: {
    marginTop: 50,
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 5,
  },
  footerText: {
    fontSize: 10,
    color: "#555555",
  },
});

type AdmissionLetterProps = {
  studentName: string;
  studentEmail: string;
  courseName: string;
  admissionDate: string;
  refNumber: string;
  studentId: string;
  transactionId?: string;
};

export const AdmissionLetterPdf = ({
  studentName,
  studentEmail,
  courseName,
  admissionDate,
  refNumber,
  studentId,
  transactionId,
}: AdmissionLetterProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image
          src="https://via.placeholder.com/50"
          style={styles.logoPlaceholder}
        />
        <View>
          <Text style={styles.instituteName}>AGRI-TECH INSTITUTE</Text>
          <Text style={{ fontSize: 10, textAlign: "right", color: "#666" }}>
            Excellence in Agriculture
          </Text>
        </View>
      </View>

      <Text style={styles.title}>OFFICIAL ADMISSION LETTER</Text>

      <View style={styles.metadataSection}>
        <Text>Date: {admissionDate}</Text>
        <Text>Ref: {refNumber}</Text>
      </View>

      <View style={styles.recipientSection}>
        <Text style={{ fontWeight: "bold" }}>To:</Text>
        <Text>{studentName}</Text>
        <Text>{studentEmail}</Text>
      </View>

      <Text style={styles.text}>Subject: Offer of Admission to {courseName}</Text>

      <Text style={styles.text}>Dear {studentName},</Text>

      <Text style={styles.text}>
        We are pleased to inform you that your application and payment for{" "}
        {courseName} have been successfully processed. It is our distinct
        pleasure to formally admit you to the {new Date().getFullYear()} session
        at Agri-Tech Institute.
      </Text>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Student ID:</Text>
          <Text style={styles.detailValue}>{studentId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Course:</Text>
          <Text style={styles.detailValue}>{courseName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date of Enrollment:</Text>
          <Text style={styles.detailValue}>{admissionDate}</Text>
        </View>
        {transactionId ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Text style={styles.detailValue}>
              Paid in Full ({transactionId})
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.text}>
        You now have full access to the Learning Management System (LMS). Please
        retain this letter as proof of your enrollment. You may access your
        course materials immediately by logging into your student dashboard.
      </Text>

      <Text style={styles.text}>
        We look forward to supporting your academic journey.
      </Text>

      <Text style={[styles.text, { marginTop: 20 }]}>Sincerely,</Text>

      <View style={styles.signatureSection}>
        <View style={styles.signatureLine} />
        <Text style={[styles.footerText, { fontWeight: "bold" }]}>
          Dr. Sarah Miller
        </Text>
        <Text style={styles.footerText}>Head of Admissions</Text>
        <Text style={styles.footerText}>Agri-Tech Institute</Text>
      </View>
    </Page>
  </Document>
);

