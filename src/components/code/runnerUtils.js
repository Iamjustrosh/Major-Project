import axios from "axios";

export async function runCode(language, code, input) {
  let source_code = code;

  // Wrap Java in Main class automatically
  if (language === "java") {
    source_code = `
public class Main {
  public static void main(String[] args) throws Exception {
    ${code}
  }
}
    `;
  }

  const langMap = { cpp: 54, python3: 71, javascript: 63, java: 62 };

  const payload = { language_id: langMap[language], source_code, stdin: input };

  const res = await axios.post(
    "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
    payload,
    {
      headers: {
        "Content-Type": "application/json"
      },
    }
  );

  const { stdout, stderr, compile_output } = res.data;
  return stdout || stderr || compile_output || "No output";
}
