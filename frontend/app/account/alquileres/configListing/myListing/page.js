'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import {
  SINGLE_LISTING_QUERY,
  RATE_USER,
  UPDATE_USER,
  GET_USER_BY_ID,
} from '@/components/queries/queries';
import formatMoney from '@/lib/formatMoney';
import { useToast } from '@/components/ToastContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import RatingForm from '@/components/RatingForm';

function ConfigListing() {
  const { user } = useAuth();
  const showToast = useToast();
  const id = useSearchParams().get('id');
  const pathname = usePathname();
  const [isLoadingVoid, setIsLoadingVoid] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [rating, setRating] = useState({});
  const [isContractExpiring, setIsContractExpiring] = useState(false);
  const page = pathname.split('/').findLast((element) => element);
  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const {
    data: ownerData,
    loading: ownerLoading,
    error: ownerError,
  } = useQuery(GET_USER_BY_ID, {
    variables: {
      id: data?.getListingById?.owner?.id,
    },
    skip: !data?.getListingById?.owner?.id,
  });

  const [rateUser] = useMutation(RATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const { form, setForm, errors, handleChange, validateFormCheck } =
    useFormValidation(
      {
        ...data?.getListingById,
        rating: 5,
        message: '',
      },
      'voidContract',
    );
  const durationStr = data?.getListingById?.contract?.contractDuration;
  const duration = parseInt(durationStr, 10);
  const contractStartDate = new Date(
    `${data?.getListingById?.contract?.contractStartDate}T00:00:00`,
  );
  const contractEnd = (() => {
    const endDate = new Date(contractStartDate);
    if (durationStr === '6') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else {
      endDate.setFullYear(endDate.getFullYear() + duration / 12);
    }
    return endDate;
  })();
  const contractEndDate = contractEnd.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const contractDurationPrefix =
    durationStr === '6' ? 'meses' : durationStr === '1' ? 'año' : 'años';

  const handleVoidContract = async () => {
    if (!validateFormCheck(undefined, 'voidContract')) {
      return;
    }

    setIsLoadingVoid(true);

    try {
      await updateUser({
        variables: {
          id,
          input: {
            contract: {
              contractNote: form?.contractNote,
            },
          },
          senderId: user?.id,
        },
      });
      setIsLoadingVoid(false);
      showToast(`Rescindiste tu contrato.`);
      await refetch();
    } catch (error) {
      console.error('Error rescindiendo el contrato:', error.message);
      showToast(
        `Hubo un error al tratar de rescindir el contrato: ${error}`,
        'error',
      );
      setIsLoadingVoid(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!validateFormCheck(undefined, 'submitRating')) {
      return;
    }

    setIsLoadingRating(true);

    try {
      await rateUser({
        variables: {
          senderId: user?.id,
          receiverId: data?.getListingById?.owner?.id,
          message: form?.message,
          rating: Number(form?.rating),
        },
      });
      setIsLoadingRating(false);
      showToast(`Calificaste al dueño!`);
      await refetch();
    } catch (error) {
      console.error('Error calificando al dueño:', error.message);
      showToast(
        `Hubo un error al tratar de calificar al dueño: ${error}`,
        'error',
      );
      setIsLoadingRating(false);
    }
  };

  useEffect(() => {
    const contractExpiring = data?.getListingById?.contract?.contractExpiring;

    if (contractExpiring) {
      setIsContractExpiring(true);
    }
  }, [data?.getListingById]);

  if (loading) {
    return (
      <Loading>
        <h4>Cargando inmueble...</h4>
      </Loading>
    );
  }

  if (error) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar el inmueble:
          {error.message}
        </p>
      </Loading>
    );
  }

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <Breadcrumb
          direccion={data?.getListingById?.direccion}
          title="alquileres"
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} listingData={data} />
        <div>
          <div className="account__info-list">
            <h5>Estas alquilando en:</h5>
            <h6>
              {data?.getListingById?.direccion},{' '}
              {data?.getListingById?.provincia}.
            </h6>
          </div>
          <div className="account__info-list">
            <h5>Estas pagando:</h5>
            <h6>
              {formatMoney(
                data?.getListingById?.precio,
                data?.getListingById?.moneda,
              )}{' '}
              por mes.
            </h6>
            {data?.getListingById?.adjustmentProvisional === 1 && (
              <p style={{ color: 'var(--primary-bg)', fontWeight: 'bold' }}>
                Ajuste provisional: el último mes de IPC aún no fue publicado.
                El monto puede variar cuando se actualice el dato oficial.
              </p>
            )}
          </div>
          <div className="account__info-list">
            <h5>Tu contrato dura:</h5>
            <h6>
              {data?.getListingById?.contract?.contractDuration === '6'
                ? data?.getListingById?.contract?.contractDuration
                : parseInt(data?.getListingById?.contract?.contractDuration) /
                  12}{' '}
              {contractDurationPrefix}.
            </h6>
          </div>
          <div className="account__info-list">
            <h5>Tu contrato vence el:</h5>
            <h6>{contractEndDate}</h6>
          </div>
          <div className="account__info-list">
            <h5>Tu ajuste es:</h5>
            <h6>{data?.getListingById?.contract?.contractAdjustmentType}.</h6>
          </div>
          <div className="account__info-list">
            <h5>Tu ajuste es por:</h5>
            <h6>{data?.getListingById?.contract?.contractAdjustmentMethod}.</h6>
          </div>
        </div>
        {isContractExpiring && (
          <RatingForm
            role="dueño"
            showExpiringDescription={isContractExpiring}
            user={user}
            otherUserData={ownerData?.getUser}
            form={form}
            setForm={setForm}
            errors={errors}
            isLoading={isLoadingRating}
            onChange={handleChange}
            onSubmit={handleSubmitRating}
          />
        )}
        <div className="account__info-inner">
          <h6>Rescindir contrato</h6>
          <p>
            Si tuviste un problema o necesitas rescindir el contrato
            tempranamente, clickeá en “Rescindir contrato” para cancelar este
            alquiler. Tené en cuenta que al rescindir el contrato tempranamente
            vas a tener que pagar el 10% del valor de todos los meses restantes
            que te quedan de contrato.
          </p>
          <fieldset>
            <label htmlFor="note">Nota al dueño:</label>
            <textarea
              name="contractNote"
              id="note"
              placeholder="Nota al dueño"
              required
              onChange={handleChange}
            ></textarea>
            {errors.contractNote && (
              <small className="text-danger">{errors.contractNote}</small>
            )}
          </fieldset>
          <div className="button-container">
            <button
              className="button button--danger"
              disabled={isLoadingVoid}
              onClick={handleVoidContract}
            >
              {isLoadingVoid ? (
                <span className="loader"></span>
              ) : (
                <span>Rescindir contrato</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConfigListing />
    </Suspense>
  );
}
