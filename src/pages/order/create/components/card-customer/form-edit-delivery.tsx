import { Button, Col, Form, Input, Row, Select } from 'antd';
import { get, map } from 'lodash';
import React, { FC, useState } from 'react';
import {
    District,
    Province,
    useDistricts,
    useProvices,
    useWards,
    Ward,
} from '../../../../../hook/useLocation';
import { useOrderNew } from '../../state/context';
import { IInfoDelivery } from '../../state/interface';

interface Props {
    infoDelivery?: IInfoDelivery;
    toggle: () => void;
}

interface FormData {
    name: string;
    phoneNo: string;
    address: string;
    ward: string;

    district: string;

    province: string;
}

const FormEditDelivery: FC<Props> = ({ infoDelivery, toggle }) => {
    const { updateInfoDelivery } = useOrderNew();
    const [form] = Form.useForm();

    const value_province = infoDelivery?.province || undefined;
    const value_district = infoDelivery?.district || undefined;

    const [province, setProvince] = useState<string | undefined>(value_province);
    const [district, setDistrict] = useState<string | undefined>(value_district);

    const { loadingProvince, provinces } = useProvices();
    const { loadingDistrict, districts } = useDistricts(province);
    const { loadingWard, wards } = useWards({ province, district });

    const removeField = (field: string) => {
        form.setFieldsValue({
            [field]: undefined,
        });
    };

    const onChangeProvince = (e: string) => {
        setProvince(e);

        removeField('district');
        removeField('ward');
        setDistrict(undefined);
    };

    const onChangeDistrict = (e: string) => {
        setDistrict(e);

        removeField('ward');
    };

    const onChangeWard = (e: string) => {};

    const onSubmit = (values: FormData) => {
        const infoDelivery: IInfoDelivery = {
            ...values,
            wardName: get(wards, values.ward).name,
            districtName: get(districts, values.district).name,
            provinceName: get(provinces, values.province).name,
        };

        updateInfoDelivery(infoDelivery);
        toggle();
    };

    return (
        <Form
            layout="vertical"
            initialValues={infoDelivery}
            form={form}
            onFinish={onSubmit}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="T??n ng?????i nh???n"
                        rules={[
                            {
                                required: true,
                                message: '??i???n t??n ng?????i nh???n',
                            },
                        ]}
                    >
                        <Input placeholder="T??n ng?????i nh???n" />
                    </Form.Item>

                    <Form.Item
                        name="phoneNo"
                        label="S??? ??i???n tho???i"
                        rules={[
                            { required: true, message: '??i???n s??? ??i???n tho???i' },
                            {
                                pattern: new RegExp(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g),
                                message: 'S??? ??i???n tho???i kh??ng ????ng',
                            },
                        ]}
                    >
                        <Input placeholder="S??? ??i???n tho???i ng?????i nh???n" />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        rules={[{ required: true, message: 'Ch???n t???nh / th??nh ph???' }]}
                        label="T???nh/Th??nh ph???"
                        name="province"
                    >
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            onChange={onChangeProvince}
                            filterOption={(input: string, option: any) =>
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                            loading={loadingProvince}
                            placeholder="Ch???n t???nh/th??nh ph???"
                        >
                            {map(provinces, (province: Province) => (
                                <Select.Option value={province.code} key={province.code}>
                                    {province.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Qu???n/Huy???n"
                        name="district"
                        rules={[{ required: true, message: 'Ch???n qu???n/huy???n' }]}
                    >
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            onChange={onChangeDistrict}
                            filterOption={(input: string, option: any) =>
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                            loading={loadingDistrict}
                            disabled={!province}
                            placeholder="Ch???n qu???n/huy???n"
                        >
                            {map(districts, (district: District) => (
                                <Select.Option value={district.code} key={district.code}>
                                    {district.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        rules={[{ required: true, message: 'Ch???n x??/ph?????ng' }]}
                        label="X??/Ph?????ng"
                        name="ward"
                    >
                        <Select
                            onChange={onChangeWard}
                            showSearch
                            filterOption={(input, option: any) =>
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={!province || !district}
                            loading={loadingWard}
                            placeholder="Ch???n x??/ph?????ng"
                        >
                            {map(wards, (ward: Ward) => (
                                <Select.Option value={ward.code} key={ward.code}>
                                    {ward.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        name="address"
                        rules={[
                            {
                                required: true,
                                message: '??i???n th??ng tin ?????a ch??? kh??ch h??ng',
                            },
                        ]}
                        label="?????a ch???"
                    >
                        <Input.TextArea placeholder="??i???n th??ng tin ?????a ch??? kh??ch h??ng" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    L??u
                </Button>
            </Form.Item>
        </Form>
    )
}

export default FormEditDelivery;