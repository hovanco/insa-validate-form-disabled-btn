import { Button, Col, Form, Input, message, Row, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { get, map, pick } from 'lodash';
import * as queryString from 'querystring';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setFlagsFromString } from 'v8';
import storeApi, { IDataCreateStore } from '../../api/store-api';
import { updateUserStorePreference } from '../../api/user-store-preference-api';
import { Loading } from '../../components';
import { disabledAutosuggestion, validChannel } from '../../helper';
import rules from '../../helper/rules';
import { useDistricts, useProvices, useWards } from '../../hook/useLocation';
import { SaleChannelId } from '../../models';
import types from '../../reducers/storeState/type';
import { IState } from '../../store/rootReducer';
import { District, Province, Ward } from './interface';

import { ValidateErrorEntity } from "rc-field-form/es/interface";
import { UnlockOutlined, UserOutlined } from '@ant-design/icons';



const { createStore, updateStore } = storeApi;

export enum ETypeForm {
    NEW = '1',
    EDIT = '2',
}
interface Props {
    type?: ETypeForm;
}

const size = 'large';
const style = { width: '100%' };

const FormCreateStore: FC<Props> = ({ type = ETypeForm.NEW }) => {
    const dispatch = useDispatch();
    const store = useSelector((state: IState) => state.store.data);
    const [form] = useForm();
    const location = useLocation();

    const regexPhone = /^((\+84|84|02[0-9])|(0[3|5|7|8|9]))+([0-9]{8})\b/;



   
    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNo, setPhoneNo] = useState("");


    
    useEffect(() => {
        if (name === "" || regexPhone.test(phoneNo) === false || address === "") {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [name, phoneNo, address]);


    const handleChange = (e:any) => {

        const { name, value } = e.target;

        console.log(value);
        console.log("sdt :", phoneNo);
        console.log("name :", name);
        console.log("address :", address);



        switch(name) {
            case 'name':
              setName(value);
              break;
            case 'address':
                setAddress(value);
                break;
            case 'phoneNo':
              setPhoneNo(value);
              break;
            default:
        }


    };

    

    const onFinish2 = (values: ETypeForm) => {
        console.log("Success:", values);
        console.log("Ok roi ban nha");
        setDisabled(false);
    };

    const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
        console.log("Failed:", errorInfo);
        console.log("Fail roi ban oi");
        setDisabled(true);
    };








    const [progress, setProgress] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [province, setProvince] = useState<string | undefined>(() => {
        if (store) {
            return store.province as string;
        }
        return undefined;
    });
    const [district, setDistrict] = useState<string | undefined>(() => {
        if (store) {
            return store.district as string;
        }
        return undefined;
    });

    const { loadingProvince, provinces } = useProvices();
    const { loadingDistrict, districts } = useDistricts(province, true);
    const { loadingWard, wards } = useWards({ province, district, loading: true });

    const onChangeProvince = (value: string) => {
        setProvince(value);
        setDistrict(undefined)
        removeField('district');
        removeField('ward')
    };

    const onChangeDistrict = (value: string) => {
        setDistrict(value);
        removeField('ward');
    };

    const removeField = (field: string) => {
        form.setFieldsValue({
            [field]: undefined,
        });
    };

    const createNewStore = async (values: IDataCreateStore) => {
        try {
            if (localStorage.getItem('shortLiveToken') !== null)
                values.saleChannels = [SaleChannelId.FACEBOOK];

            const querySearch: {
                saleChannel?: SaleChannelId;
            } = queryString.parse(location.search.replace('?', ''));

            let data = values;

            if (querySearch.saleChannel && validChannel(querySearch.saleChannel)) {
                data = {
                    ...values,
                    saleChannels: [querySearch.saleChannel],
                };
            }

            const result = await createStore(data);

            await updateUserStorePreference({
                storeId: result._id,
                hideNewUserGuide: false,
            });

            dispatch({
                type: types.SET_STORE,
                payload: result,
            });
        } catch (error) {
            if (get(error, 'response.status') === 409) {
                return message.error('T??n c???a h??ng ???? t???n t???i. Vui l??ng nh???p t??n kh??c');
            }
            return message.error('L???i t???o c???a h??ng');
        } finally {
            setLoading(false);
        }
    };

    const editStore = async (values: IDataCreateStore) => {
        try {
            const result = await updateStore(store._id as string, {
                ...values,
            });

            dispatch({
                type: types.SET_STORE,
                payload: result,
            });
        } catch (error) {
            message.error('L???i ch???nh s???a c???a h??ng');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = (values: IDataCreateStore) => {
        setLoading(true);
        if (type === ETypeForm.NEW) {
            createNewStore(values);
        } else {
            editStore(values);
        }
    };

    useEffect(() => {
        if (
            (!loadingDistrict && !loadingWard && type === ETypeForm.EDIT) ||
            type === ETypeForm.NEW
        ) {
            setProgress(false);
        }
    }, [loadingDistrict, loadingWard, type]);

    if (progress) {
        return (
            <div style={{ height: 320 }}>
                <Loading full />
            </div>
        );
    }

    return (
        <Form
            layout="vertical"
            initialValues={{
                ...pick(store, ['name', 'phoneNo', 'address', 'province', 'district', 'ward']),
            }}
            form={form}
            onFinish={onFinish2}
            onFinishFailed={onFinishFailed}

        >
            <Form.Item
                name="name"
                label="T??n c???a h??ng"
                rules={[{ required: true, message: 'Vui l??ng nh???p T??n c???a h??ng' }]}
            >
                <Input
                    size={size}
                    placeholder="T??n c???a h??ng"
                    autoFocus

                    name="name"
                    value={name}
                    onChange={handleChange}
                />
            </Form.Item>

            <Form.Item
                name="phoneNo"
                label="S??? ??i???n tho???i"
                rules={[
                    { required: true, message: 'Vui l??ng nh???p S??? ??i???n tho???i' },
                    {
                        validator: rules.validatePhone,
                    },
                ]}
            >
                <Input
                    style={style}
                    size={size}
                    placeholder="S??? ??i???n tho???i c???a h??ng"

                    
                    pattern={`${regexPhone}`}
                    name="phoneNo"
                    value={phoneNo}
                    onChange={handleChange}
                />
            </Form.Item>

            <Row gutter={15}>
                <Col md={8}>
                    <Form.Item
                        name="province"
                        label="T???nh/th??nh ph???"
                        rules={[
                            {
                                required: true,
                                message: 'Ch???n t???nh/th??nh ph???',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            onChange={onChangeProvince}
                            filterOption={(input: string, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            loading={loadingProvince}
                            onFocus={disabledAutosuggestion}
                            placeholder="Ch???n t???nh/th??nh ph???"
                        >
                            <Select.Option value={'-1'} key={'-1'} disabled>
                                Ch???n t???nh/th??nh ph???
                            </Select.Option>

                            {map(provinces, (province: Province) => (
                                <Select.Option value={province.code} key={province.code}>
                                    {province.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col md={8}>
                    <Form.Item
                        name="district"
                        label="Qu???n/huy???n"
                        rules={[{ required: true, message: 'Ch???n qu???n/huy???n' }]}


                    >
                        <Select
                            size={size}
                            placeholder="Ch???n qu???n/huy???n"
                            onChange={onChangeDistrict}
                            showSearch
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={!province}
                            loading={loadingDistrict}
                            onFocus={disabledAutosuggestion}
                        >
                            <Select.Option value={'-1'} key={'-1'} disabled>
                                Ch???n qu???n/huy???n
                            </Select.Option>
                            {map(districts, (district: District) => (
                                <Select.Option value={district.code} key={district.code}>
                                    {district.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col md={8}>
                    <Form.Item
                        name="ward"
                        label="X??/ph?????ng"
                        rules={[{ required: true, message: 'Ch???n x??/ph?????ng' }]}
                    >
                        <Select
                            size={size}
                            placeholder="Ch???n x??/ph?????ng"
                            showSearch
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={!district}
                            loading={loadingWard}
                            onFocus={disabledAutosuggestion}
                        >
                            <Select.Option value={'-1'} key={'-1'} disabled>
                                Ch???n x??/ph?????ng
                            </Select.Option>
                            {map(wards, (ward: Ward) => {
                                return (
                                    <Select.Option value={ward.code} key={ward.code}>
                                        {ward.name}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="address"
                rules={[{ required: true, message: 'Vui l??ng nh???p ?????a ch???' }]}
                label="?????a ch???"
            >
                <Input.TextArea
                    autoComplete="off"
                    placeholder="??i???n ?????a ch??? c???a h??ng"
                    rows={3}

                    name="address"
                    value={address}
                    onChange={handleChange}
                ></Input.TextArea>
            </Form.Item>

            <Form.Item>
                <Button type="primary" size={size} htmlType="submit" block  disabled={disabled} >
                    {type === ETypeForm.EDIT ? 'Ch???nh s???a c???a h??ng' : 'T???o c???a h??ng'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default FormCreateStore;


/////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// import { Button, Col, Form, Input, message, Row, Select } from 'antd';
// import { useForm } from 'antd/lib/form/Form';
// import { get, map, pick } from 'lodash';
// import * as queryString from 'querystring';
// import React, { FC, useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
// import storeApi, { IDataCreateStore } from '../../api/store-api';
// import { updateUserStorePreference } from '../../api/user-store-preference-api';
// import { Loading } from '../../components';
// import { disabledAutosuggestion, validChannel } from '../../helper';
// import rules from '../../helper/rules';
// import { useDistricts, useProvices, useWards } from '../../hook/useLocation';
// import { SaleChannelId } from '../../models';
// import types from '../../reducers/storeState/type';
// import { IState } from '../../store/rootReducer';
// import { District, Province, Ward } from './interface';

// const { createStore, updateStore } = storeApi;

// export enum ETypeForm {
//     NEW = '1',
//     EDIT = '2',
// }
// interface Props {
//     type?: ETypeForm;
// }

// const size = 'large';
// const style = { width: '100%' };

// const FormCreateStore: FC<Props> = ({ type = ETypeForm.NEW }) => {
//     const dispatch = useDispatch();
//     const store = useSelector((state: IState) => state.store.data);
//     const [form] = useForm();
//     const location = useLocation();

//     const [progress, setProgress] = useState<boolean>(true);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [province, setProvince] = useState<string | undefined>(() => {
//         if (store) {
//             return store.province as string;
//         }
//         return undefined;
//     });
//     const [district, setDistrict] = useState<string | undefined>(() => {
//         if (store) {
//             return store.district as string;
//         }
//         return undefined;
//     });

//     const { loadingProvince, provinces } = useProvices();
//     const { loadingDistrict, districts } = useDistricts(province, true);
//     const { loadingWard, wards } = useWards({ province, district, loading: true });

//     const onChangeProvince = (value: string) => {
//         setProvince(value);
//         setDistrict(undefined)
//         removeField('district');
//         removeField('ward')
//     };

//     const onChangeDistrict = (value: string) => {
//         setDistrict(value);

//         removeField('ward');
//     };

//     const removeField = (field: string) => {
//         form.setFieldsValue({
//             [field]: undefined,
//         });
//     };

//     const createNewStore = async (values: IDataCreateStore) => {
//         try {
//             if (localStorage.getItem('shortLiveToken') !== null)
//                 values.saleChannels = [SaleChannelId.FACEBOOK];

//             const querySearch: {
//                 saleChannel?: SaleChannelId;
//             } = queryString.parse(location.search.replace('?', ''));

//             let data = values;

//             if (querySearch.saleChannel && validChannel(querySearch.saleChannel)) {
//                 data = {
//                     ...values,
//                     saleChannels: [querySearch.saleChannel],
//                 };
//             }

//             const result = await createStore(data);

//             await updateUserStorePreference({
//                 storeId: result._id,
//                 hideNewUserGuide: false,
//             });

//             dispatch({
//                 type: types.SET_STORE,
//                 payload: result,
//             });
//         } catch (error) {
//             if (get(error, 'response.status') === 409) {
//                 return message.error('T??n c???a h??ng ???? t???n t???i. Vui l??ng nh???p t??n kh??c');
//             }
//             return message.error('L???i t???o c???a h??ng');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const editStore = async (values: IDataCreateStore) => {
//         try {
//             const result = await updateStore(store._id as string, {
//                 ...values,
//             });

//             dispatch({
//                 type: types.SET_STORE,
//                 payload: result,
//             });
//         } catch (error) {
//             message.error('L???i ch???nh s???a c???a h??ng');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const onFinish = (values: IDataCreateStore) => {
//         setLoading(true);
//         if (type === ETypeForm.NEW) {
//             createNewStore(values);
//         } else {
//             editStore(values);
//         }
//     };

//     useEffect(() => {
//         if (
//             (!loadingDistrict && !loadingWard && type === ETypeForm.EDIT) ||
//             type === ETypeForm.NEW
//         ) {
//             setProgress(false);
//         }
//     }, [loadingDistrict, loadingWard, type]);

//     if (progress) {
//         return (
//             <div style={{ height: 320 }}>
//                 <Loading full />
//             </div>
//         );
//     }

//     return (
//         <Form
//             layout="vertical"
//             form={form}
//             onFinish={onFinish}
//             initialValues={{
//                 ...pick(store, ['name', 'phoneNo', 'address', 'province', 'district', 'ward']),
//             }}
//         >
//             <Form.Item
//                 name="name"
//                 label="T??n c???a h??ng"
//                 rules={[{ required: true, message: 'Vui l??ng nh???p T??n c???a h??ng' }]}
//             >
//                 <Input size={size} placeholder="T??n c???a h??ng" autoFocus />
//             </Form.Item>

//             <Form.Item
//                 name="phoneNo"
//                 label="S??? ??i???n tho???i"
//                 rules={[
//                     { required: true, message: 'Vui l??ng nh???p S??? ??i???n tho???i' },
//                     {
//                         validator: rules.validatePhone,
//                     },
//                 ]}
//             >
//                 <Input style={style} size={size} placeholder="S??? ??i???n tho???i c???a h??ng" />
//             </Form.Item>

//             <Row gutter={15}>
//                 <Col md={8}>
//                     <Form.Item
//                         name="province"
//                         label="T???nh/th??nh ph???"
//                         rules={[
//                             {
//                                 required: true,
//                                 message: 'Ch???n t???nh/th??nh ph???',
//                             },
//                         ]}
//                     >
//                         <Select
//                             showSearch
//                             style={{ width: '100%' }}
//                             optionFilterProp="children"
//                             onChange={onChangeProvince}
//                             filterOption={(input: string, option: any) =>
//                                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                             }
//                             loading={loadingProvince}
//                             onFocus={disabledAutosuggestion}
//                             placeholder="Ch???n t???nh/th??nh ph???"
//                         >
//                             <Select.Option value={'-1'} key={'-1'} disabled>
//                                 Ch???n t???nh/th??nh ph???
//                             </Select.Option>

//                             {map(provinces, (province: Province) => (
//                                 <Select.Option value={province.code} key={province.code}>
//                                     {province.name}
//                                 </Select.Option>
//                             ))}
//                         </Select>
//                     </Form.Item>
//                 </Col>

//                 <Col md={8}>
//                     <Form.Item
//                         name="district"
//                         label="Qu???n/huy???n"
//                         rules={[{ required: true, message: 'Ch???n qu???n/huy???n' }]}
//                     >
//                         <Select
//                             size={size}
//                             placeholder="Ch???n qu???n/huy???n"
//                             onChange={onChangeDistrict}
//                             showSearch
//                             filterOption={(input, option: any) =>
//                                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                             }
//                             disabled={!province}
//                             loading={loadingDistrict}
//                             onFocus={disabledAutosuggestion}
//                         >
//                             <Select.Option value={'-1'} key={'-1'} disabled>
//                                 Ch???n qu???n/huy???n
//                             </Select.Option>
//                             {map(districts, (district: District) => (
//                                 <Select.Option value={district.code} key={district.code}>
//                                     {district.name}
//                                 </Select.Option>
//                             ))}
//                         </Select>
//                     </Form.Item>
//                 </Col>

//                 <Col md={8}>
//                     <Form.Item
//                         name="ward"
//                         label="X??/ph?????ng"
//                         rules={[{ required: true, message: 'Ch???n x??/ph?????ng' }]}
//                     >
//                         <Select
//                             size={size}
//                             placeholder="Ch???n x??/ph?????ng"
//                             showSearch
//                             filterOption={(input, option: any) =>
//                                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                             }
//                             disabled={!district}
//                             loading={loadingWard}
//                             onFocus={disabledAutosuggestion}
//                         >
//                             <Select.Option value={'-1'} key={'-1'} disabled>
//                                 Ch???n x??/ph?????ng
//                             </Select.Option>
//                             {map(wards, (ward: Ward) => {
//                                 return (
//                                     <Select.Option value={ward.code} key={ward.code}>
//                                         {ward.name}
//                                     </Select.Option>
//                                 );
//                             })}
//                         </Select>
//                     </Form.Item>
//                 </Col>
//             </Row>

//             <Form.Item
//                 name="address"
//                 rules={[{ required: true, message: 'Vui l??ng nh???p ?????a ch???' }]}
//                 label="?????a ch???"
//             >
//                 <Input.TextArea
//                     autoComplete="off"
//                     placeholder="??i???n ?????a ch??? c???a h??ng"
//                     rows={3}
//                 ></Input.TextArea>
//             </Form.Item>

//             <Form.Item>
//                 <Button type="primary" size={size} htmlType="submit" block loading={loading}>
//                     {type === ETypeForm.EDIT ? 'Ch???nh s???a c???a h??ng' : 'T???o c???a h??ng'}
//                 </Button>
//             </Form.Item>
//         </Form>
//     );
// };

// export default FormCreateStore;

