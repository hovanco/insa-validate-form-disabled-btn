import { Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import rules from '../../../../../helper/rules';
import { businessTypes } from './businessTypes';
import './infor-shop.less';

interface Props {}

const InforShop = (props: Props) => {
    return (
        <Row gutter={[50, 0]}>
            <Col span={24}>
                <Form.Item
                    label="Tên cửa hàng"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Nhập tên cửa hàng',
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên cửa hàng" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Số điện thoại"
                    name="phoneNo"
                    rules={[
                        { required: true, message: 'Điền số điện thoại' },
                        {
                            validator: rules.validatePhone,
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại cửa hàng" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Nhập email cửa hàng',
                        },
                    ]}
                >
                    <Input placeholder=" cửa hàng" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="Fax" name="fax">
                    <Input placeholder="Nhập fax cửa hàng" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="Lĩnh vực kinh doanh" name="businessType">
                    <Select placeholder="Chọn lĩnh vực kinh doanh">
                        <Select.Option value="-1" disabled>
                            Chọn lĩnh vực kinh doanh
                        </Select.Option>
                        {businessTypes.map((item) => (
                            <Select.Option value={item.value} key={item.value}>
                                {item.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    );
};

export default InforShop;
