import { Flex, Form, message } from "antd";
import { ReactNode, useRef, useCallback, useMemo } from "react";
import UseMessage from "@/hooks/useMessage";

interface AFormProps  {
  form: any;
  children: ReactNode;
  buttonTop?: ReactNode;
  buttonBottom?: ReactNode;
  title?: string | ReactNode;    // 폼 상단 제목
  labelSize?: number;
  colCnt?: number;
  type?: "search" | "register";
  onSubmit?: (values: any) => void | Promise<void>;
  messageKey:string;
}

export default function AForm({
  form,
  children,
  buttonTop,
  buttonBottom,
  title,
  labelSize = 100,
  colCnt,
  type = "register",
  onSubmit,
  messageKey
}: AFormProps) {
  const isSubmitting = useRef(false);
  const { success, error, info, destroy, contextHolder } = UseMessage(messageKey);


  const columns = useMemo(() => {
    if (colCnt) return colCnt;
    return type === "search" ? 4 : 2;
  }, [colCnt, type]);

  const cols = useMemo(() => {
    const arr = [];
    for (let i = 0; i < columns ; i++) {
      arr.push(<col key={`label-${i}`} style={{ width: labelSize }} />);
      arr.push(<col key={`input-${i}`} style={{ width: "auto" }} />);
    }
    return arr;
  }, [columns, labelSize]); 

  const handleSubmit = useCallback(async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      const values = await form.validateFields();
      if (onSubmit) await onSubmit(values);
      return values;
    } finally {
      isSubmitting.current = false;
    }
  }, [form, onSubmit]);

  const handleFinishFailed = useCallback(
    (errorInfo: any) => {
      if (errorInfo.errorFields?.length > 0) {
        const firstError = errorInfo.errorFields[0].errors[0];
        error(firstError);
        
        form.scrollToField(errorInfo.errorFields[0].name[0]);
      }
    },
    [form]
  );

  return (
    <Form form={form} 
      layout="horizontal" 
      onFinish={handleSubmit} 
      onFinishFailed={handleFinishFailed}
      scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
    >
        {contextHolder}
       {(title || buttonTop) && (
        <div
        style={{
            display: "flex",
            justifyContent: "space-between", // 왼쪽 버튼, 오른쪽 제목
            alignItems: "center",
            marginBottom: 8,
        }}
        >
        <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
        <div style={{gap: 3, display:"flex"}}>{buttonTop}</div>
        
        </div>
    )}
      {/* 테이블 폼 */}
      <div className={type}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} >
            <colgroup>{cols}</colgroup>
            <tbody>{children}</tbody>
        </table>
      </div>
      {buttonBottom && (
            <div style={{
                display: "flex",
                justifyContent: "flex-end",  // 오른쪽 정렬
                alignItems: "flex-start",    // 버튼 위쪽 정렬
                marginTop: 5,
                gap:3 }}
            >
            {buttonBottom}
            </div>
        )}
    </Form>
  );
}
