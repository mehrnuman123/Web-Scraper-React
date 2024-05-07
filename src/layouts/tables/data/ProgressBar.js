import MDBox from "components/MDBox";
import MDProgress from "components/MDProgress";
import MDTypography from "components/MDTypography";

const Progress = ({ color, value }) => (
    <MDBox display="flex" alignItems="center">
        <MDTypography variant="caption" color="text" fontWeight="medium">
            {value}%
        </MDTypography>
        <MDBox ml={0.5} width="9rem">
            <MDProgress variant="gradient" color={color} value={value} />
        </MDBox>
    </MDBox>
);

export default Progress